import 'dart:math';

import 'package:flutter/material.dart';

import '../l10n/format.dart';
import '../theme/tokens.dart';
import 'models.dart';

/// In-memory mock of the member's wallet. Everything the screens show comes
/// from here, so earning and redeeming visibly move the balance, activity
/// feed and voucher list.
class AppState extends ChangeNotifier {
  AppState({DateTime? now}) : _anchor = now ?? DateTime.now() {
    _seed();
  }

  final DateTime _anchor;
  final _rng = Random(20260919);
  int _nextId = 1;

  // ── Preferences ──
  Lang lang = Lang.vi;
  Color brand = Palette.brandOptions.first;
  int tab = 0;

  // ── Member ──
  String phone = '+84 901 234 567';
  final String name = 'Minh Anh';
  int balance = 2480;
  int tierPoints = 2480;
  final int expiringPoints = 320;
  late final DateTime expiringOn = DateTime(_anchor.year, 12, 31);

  final List<Tx> txs = [];
  final List<Voucher> vouchers = [];
  late final List<Reward> rewards;
  late final List<AppNotification> notifications;
  final Set<String> _claimedCodes = {};
  final Map<NotificationKind, bool> notificationPrefs = {
    for (final k in NotificationKind.values) k: true,
  };

  DateTime get now => DateTime.now();

  // ── Tier ──
  Tier get tier => Tier.values.lastWhere((t) => tierPoints >= t.threshold);
  int get pointsToNextTier => (tier.next?.threshold ?? tierPoints) - tierPoints;
  double get tierProgress {
    final next = tier.next;
    return next == null ? 1 : (tierPoints / next.threshold).clamp(0, 1);
  }

  List<Voucher> get activeVouchers => vouchers
      .where(
        (v) => switch (v.statusAt(now)) {
          VoucherStatus.ready || VoucherStatus.expiringSoon => true,
          _ => false,
        },
      )
      .toList();

  List<AppNotification> get visibleNotifications =>
      notifications.where((n) => notificationPrefs[n.kind]!).toList();

  // ── Preferences ──
  void setLang(Lang value) {
    lang = value;
    notifyListeners();
  }

  void toggleLang() => setLang(lang == Lang.vi ? Lang.en : Lang.vi);

  void setBrand(Color value) {
    brand = value;
    notifyListeners();
  }

  void setTab(int value) {
    tab = value;
    notifyListeners();
  }

  void setNotificationPref(NotificationKind kind, bool on) {
    notificationPrefs[kind] = on;
    notifyListeners();
  }

  void signOut() {
    tab = 0;
    notifyListeners();
  }

  // ── Actions ──

  /// Claims the code printed on a receipt, e.g. `LTM-4K29-8842`.
  /// The last four digits stand in for the bill total: 8842 → 88 Petals
  /// on an 880.000 ₫ bill (1 Petal per 10.000 ₫).
  Tx claimBillCode(String raw) {
    final code = raw.trim().toUpperCase();
    final match = RegExp(r'^LTM-[A-Z0-9]{4}-(\d{4})$').firstMatch(code);
    if (match == null) throw const ClaimException(ClaimError.invalid);
    if (_claimedCodes.contains(code)) {
      throw const ClaimException(ClaimError.used);
    }
    _claimedCodes.add(code);

    final points = max(1, int.parse(match.group(1)!) ~/ 100);
    final bill = points * 10000;
    final tx = _tx(
      TxKind.earn,
      L('Hoá đơn ${vnd(bill, Lang.vi)}', 'Bill ${vnd(bill, Lang.en)}'),
      const L('Lotus Q7'),
      now,
      points,
    );
    txs.insert(0, tx);
    balance += points;
    tierPoints += points;
    notifyListeners();
    return tx;
  }

  Voucher redeem(Reward reward) {
    if (reward.cost > balance) {
      throw StateError('Not enough Petals for ${reward.id}');
    }
    balance -= reward.cost;
    txs.insert(
      0,
      _tx(TxKind.redeem, reward.title, L(reward.partner), now, -reward.cost),
    );
    final voucher = Voucher(
      id: 'v${_nextId++}',
      title: reward.title,
      partner: reward.partner,
      code: _voucherCode(reward.partner),
      expires: now.add(Duration(days: reward.validDays)),
    );
    vouchers.insert(0, voucher);
    notifyListeners();
    return voucher;
  }

  // ── Seed data (mirrors the design mock) ──

  void _seed() {
    final a = _anchor;
    txs.addAll([
      _tx(
        TxKind.earn,
        L('Hoá đơn ${vnd(520000, Lang.vi)}', 'Bill ${vnd(520000, Lang.en)}'),
        const L('Lotus Q7'),
        a.subtract(const Duration(hours: 2)),
        52,
      ),
      _tx(
        TxKind.redeem,
        const L('Vé xem phim 2D', '2D cinema ticket'),
        const L('Lumière'),
        a.subtract(const Duration(days: 1, hours: 3)),
        -800,
      ),
      _tx(
        TxKind.bonus,
        const L('Thưởng cuối tuần', 'Weekend bonus'),
        const L('Chiến dịch', 'Campaign'),
        a.subtract(const Duration(days: 5, hours: 1)),
        96,
      ),
      _tx(
        TxKind.earn,
        L('Hoá đơn ${vnd(1240000, Lang.vi)}', 'Bill ${vnd(1240000, Lang.en)}'),
        const L('Lotus Q1'),
        a.subtract(const Duration(days: 8, hours: 4)),
        124,
      ),
      _tx(
        TxKind.redeem,
        const L('Combo cà phê + bánh', 'Coffee + pastry combo'),
        const L('Phố Cà Phê'),
        a.subtract(const Duration(days: 12, hours: 6)),
        -450,
      ),
    ]);

    vouchers.addAll([
      Voucher(
        id: 'v${_nextId++}',
        title: const L('Vé xem phim 2D', '2D cinema ticket'),
        partner: 'Lumière Cinema',
        code: 'LUM-9F2K-44QX',
        expires: a.add(const Duration(days: 72)),
      ),
      Voucher(
        id: 'v${_nextId++}',
        title: L(
          'Phiếu mua hàng ${vnd(100000, Lang.vi)}',
          '${vnd(100000, Lang.en)} credit',
        ),
        partner: 'Lotus Mart',
        code: 'LTM-C100-7731',
        expires: a.add(const Duration(days: 16)),
      ),
      Voucher(
        id: 'v${_nextId++}',
        title: const L('Combo cà phê + bánh', 'Coffee + pastry combo'),
        partner: 'Phố Cà Phê',
        code: 'PCP-2210-81XA',
        expires: a.add(const Duration(days: 40)),
        usedAt: a.subtract(const Duration(days: 7)),
      ),
    ]);

    rewards = [
      const Reward(
        id: 'r-cinema',
        title: L('Vé xem phim 2D', '2D cinema ticket'),
        partner: 'Lumière Cinema',
        network: Network.octap,
        cost: 800,
      ),
      Reward(
        id: 'r-credit',
        title: L(
          'Phiếu mua hàng ${vnd(100000, Lang.vi)}',
          '${vnd(100000, Lang.en)} credit',
        ),
        partner: 'Lotus Mart',
        network: Network.lotus,
        cost: 1000,
        validDays: 30,
      ),
      const Reward(
        id: 'r-coffee',
        title: L('Combo cà phê + bánh', 'Coffee + pastry combo'),
        partner: 'Phố Cà Phê',
        network: Network.octap,
        cost: 450,
      ),
      const Reward(
        id: 'r-hamper',
        title: L('Giỏ quà Tết thủ công', 'Handmade Tết hamper'),
        partner: 'Lotus Mart',
        network: Network.lotus,
        cost: 6500,
      ),
    ];

    final cinema = vouchers.first;
    notifications = [
      AppNotification(
        kind: NotificationKind.expiry,
        network: Network.lotus,
        title: L(
          '${groupDigits(expiringPoints, Lang.vi)} Sen sắp hết hạn',
          '${groupDigits(expiringPoints, Lang.en)} Petals expiring',
        ),
        body: L(
          'Hết hạn ${shortDate(expiringOn, Lang.vi)}. Đổi ngay lấy voucher trước khi mất.',
          'They expire ${shortDate(expiringOn, Lang.en)} — swap them for a voucher.',
        ),
        at: a.subtract(const Duration(minutes: 2)),
      ),
      AppNotification(
        kind: NotificationKind.promo,
        network: Network.lotus,
        title: const L('Cuối tuần nhân đôi Sen', 'Double Petals this weekend'),
        body: const L(
          'Thứ Bảy – Chủ Nhật, mọi hoá đơn tại siêu thị.',
          'Saturday and Sunday, every in-store bill.',
        ),
        at: a.subtract(const Duration(days: 1, hours: 2)),
      ),
      AppNotification(
        kind: NotificationKind.voucher,
        network: Network.octap,
        title: const L(
          'Voucher vé phim đã sẵn sàng',
          'Your cinema voucher is ready',
        ),
        body: L(
          'Mã ${cinema.code}, dùng đến ${shortDate(cinema.expires, Lang.vi)}.',
          'Code ${cinema.code}, valid to ${shortDate(cinema.expires, Lang.en)}.',
        ),
        at: a.subtract(const Duration(days: 3)),
      ),
    ];
  }

  Tx _tx(TxKind kind, L title, L store, DateTime at, int points) => Tx(
    id: 't${_nextId++}',
    kind: kind,
    title: title,
    store: store,
    at: at,
    points: points,
    digest: _base58(44),
    checkpoint: 184226904 + _nextId * 1733,
  );

  static const _b58 =
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  static const _alnum = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  String _base58(int length) =>
      List.generate(length, (_) => _b58[_rng.nextInt(_b58.length)]).join();

  String _voucherCode(String partner) {
    final letters = partner.toUpperCase().replaceAll(RegExp('[^A-Z]'), '');
    final prefix = letters.padRight(3, 'X').substring(0, 3);
    String block() =>
        List.generate(4, (_) => _alnum[_rng.nextInt(_alnum.length)]).join();
    return '$prefix-${block()}-${block()}';
  }
}

class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child})
    : super(notifier: state);

  static AppState of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AppScope>()!.notifier!;

  /// Read without subscribing — for callbacks.
  static AppState read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
}

extension AppContext on BuildContext {
  AppState get app => AppScope.of(this);

  Lang get lang => AppScope.of(this).lang;

  String tr(String vi, String en) => lang == Lang.vi ? vi : en;
}
