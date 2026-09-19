enum Lang { vi, en }

/// A bilingual string. The design ships every label in Vietnamese and English.
class L {
  const L(this.vi, [String? en]) : en = en ?? vi;

  final String vi;
  final String en;

  String of(Lang lang) => lang == Lang.vi ? vi : en;
}

enum Tier {
  silver(0, L('Bạc', 'Silver')),
  gold(2000, L('Vàng', 'Gold')),
  platinum(8000, L('Bạch Kim', 'Platinum'));

  const Tier(this.threshold, this.label);

  final int threshold;
  final L label;

  Tier? get next =>
      index + 1 < Tier.values.length ? Tier.values[index + 1] : null;
}

enum TxKind {
  earn(L('Tích Sen', 'Earn')),
  redeem(L('Đổi quà', 'Redeem')),
  bonus(L('Thưởng', 'Bonus'));

  const TxKind(this.label);

  final L label;
}

class Tx {
  const Tx({
    required this.id,
    required this.kind,
    required this.title,
    required this.store,
    required this.at,
    required this.points,
    required this.digest,
    required this.checkpoint,
  });

  final String id;
  final TxKind kind;
  final L title;
  final L store;
  final DateTime at;

  /// Signed: positive for earn/bonus, negative for redeem.
  final int points;
  final String digest;
  final int checkpoint;

  String get shortDigest =>
      '${digest.substring(0, 8)}…${digest.substring(digest.length - 4)}';
}

enum Network {
  lotus('Lotus Mart'),
  octap('OctaP');

  const Network(this.label);

  final String label;
}

class Reward {
  const Reward({
    required this.id,
    required this.title,
    required this.partner,
    required this.network,
    required this.cost,
    this.validDays = 60,
  });

  final String id;
  final L title;
  final String partner;
  final Network network;
  final int cost;
  final int validDays;
}

enum VoucherStatus { ready, expiringSoon, used, expired }

class Voucher {
  Voucher({
    required this.id,
    required this.title,
    required this.partner,
    required this.code,
    required this.expires,
    this.usedAt,
  });

  final String id;
  final L title;
  final String partner;
  final String code;
  final DateTime expires;
  DateTime? usedAt;

  VoucherStatus statusAt(DateTime now) {
    if (usedAt != null) return VoucherStatus.used;
    if (expires.isBefore(now)) return VoucherStatus.expired;
    if (expires.difference(now).inDays <= 30) return VoucherStatus.expiringSoon;
    return VoucherStatus.ready;
  }
}

enum NotificationKind {
  expiry(
    L('Nhắc Sen sắp hết hạn', 'Expiry reminders'),
    L(
      'Báo trước khi Sen hoặc voucher hết hạn',
      'Before Petals or vouchers lapse',
    ),
  ),
  promo(
    L('Khuyến mãi', 'Promotions'),
    L('Chiến dịch nhân Sen, ưu đãi mới', 'Bonus campaigns and new offers'),
  ),
  voucher(
    L('Trạng thái voucher', 'Voucher status'),
    L('Khi voucher đã sẵn sàng để dùng', 'When a voucher is ready to use'),
  );

  const NotificationKind(this.label, this.hint);

  final L label;
  final L hint;
}

class AppNotification {
  const AppNotification({
    required this.kind,
    required this.network,
    required this.title,
    required this.body,
    required this.at,
  });

  final NotificationKind kind;
  final Network network;
  final L title;
  final L body;
  final DateTime at;
}

enum ClaimError { invalid, used }

class ClaimException implements Exception {
  const ClaimException(this.error);

  final ClaimError error;
}
