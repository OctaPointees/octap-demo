import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../state/models.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';
import '../me/notifications_screen.dart';
import 'activity_screen.dart';
import 'transaction_detail_screen.dart';

/// 03 · Wallet home
class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lang = app.lang;
    final brand = context.brand;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Column(
        children: [
          _BalanceHeader(app: app, brand: brand),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 20),
              children: [
                Callout(
                  tone: Tone.warning,
                  title: context.tr(
                    '${groupDigits(app.expiringPoints, lang)} Sen hết hạn ${shortDate(app.expiringOn, lang)}',
                    '${groupDigits(app.expiringPoints, lang)} Petals expire ${shortDate(app.expiringOn, lang)}',
                  ),
                  body: context.tr(
                    'Đổi trước ngày này để không mất điểm.',
                    'Spend them before then.',
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _ActionTile(
                        filled: true,
                        icon: Icons.qr_code_scanner,
                        label: context.tr('Quét mã tích Sen', 'Scan to earn'),
                        onTap: () => app.setTab(1),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _ActionTile(
                        filled: false,
                        icon: Icons.keyboard_outlined,
                        label: context.tr(
                          'Nhập mã trên hoá đơn',
                          'Enter bill code',
                        ),
                        onTap: () => app.setTab(1),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                SectionHeader(
                  title: context.tr('Hoạt động gần đây', 'Recent activity'),
                  action: context.tr('Tất cả', 'All'),
                  onAction: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ActivityScreen()),
                  ),
                ),
                const SizedBox(height: 10),
                Panel(
                  child: Column(
                    children: [
                      for (final (i, tx) in app.txs.take(3).indexed)
                        TxRow(
                          tx: tx,
                          divider: i < 2 && i < app.txs.length - 1,
                          onTap: () => openTxDetail(context, tx),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

void openTxDetail(BuildContext context, Tx tx) => Navigator.of(
  context,
).push(MaterialPageRoute(builder: (_) => TransactionDetailScreen(tx: tx)));

class _BalanceHeader extends StatelessWidget {
  const _BalanceHeader({required this.app, required this.brand});

  final AppState app;
  final Color brand;

  @override
  Widget build(BuildContext context) {
    final lang = app.lang;
    final next = app.tier.next;
    final translucent = Colors.white.withValues(alpha: 0.15);
    final pct = (app.tierProgress * 100).round();

    return Container(
      width: double.infinity,
      color: brand,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 10, 14, 22),
          child: DefaultTextStyle(
            style: AppText.body(14, color: Colors.white),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    BrandMark(
                      size: 26,
                      radius: 8,
                      fontSize: 13,
                      color: translucent,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Lotus Mart',
                      style: AppText.body(
                        15,
                        weight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: translucent,
                        borderRadius: BorderRadius.circular(Radii.pill),
                      ),
                      child: Text(
                        lang == Lang.vi
                            ? 'Hạng ${app.tier.label.vi}'
                            : app.tier.label.en,
                        style: AppText.body(
                          11.5,
                          weight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: context.tr('Thông báo', 'Notifications'),
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const NotificationsScreen(),
                        ),
                      ),
                      icon: Badge(
                        isLabelVisible: app.visibleNotifications.isNotEmpty,
                        smallSize: 7,
                        backgroundColor: Palette.warning,
                        child: const Icon(
                          Icons.notifications_none,
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Opacity(
                  opacity: 0.82,
                  child: Text(
                    context.tr('Sen khả dụng', 'Petals available'),
                    style: AppText.body(12, color: Colors.white),
                  ),
                ),
                TweenAnimationBuilder<double>(
                  tween: Tween(end: app.balance.toDouble()),
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeOutCubic,
                  builder: (_, v, _) => Text(
                    groupDigits(v.round(), lang),
                    style: AppText.display(
                      44,
                      color: Colors.white,
                      trackingEm: -0.035,
                      height: 1.05,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(0, 14, 0, 7),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(Radii.pill),
                          child: LinearProgressIndicator(
                            value: app.tierProgress,
                            minHeight: 6,
                            color: Colors.white,
                            backgroundColor: Colors.white.withValues(
                              alpha: 0.2,
                            ),
                          ),
                        ),
                      ),
                      Opacity(
                        opacity: 0.86,
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                next == null
                                    ? context.tr(
                                        'Bạn đang ở hạng cao nhất',
                                        'You are at the top tier',
                                      )
                                    : context.tr(
                                        'Còn ${groupDigits(app.pointsToNextTier, lang)} Sen lên ${next.label.vi}',
                                        '${groupDigits(app.pointsToNextTier, lang)} Petals to ${next.label.en}',
                                      ),
                                style: AppText.body(11.5, color: Colors.white),
                              ),
                            ),
                            Text(
                              '$pct%',
                              style: AppText.mono(11.5, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.filled,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final bool filled;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final fg = filled ? Colors.white : Palette.ink;
    return Material(
      color: filled ? context.brand : Palette.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(Radii.box),
        side: filled ? BorderSide.none : const BorderSide(color: Palette.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 20, color: fg),
              const SizedBox(height: 6),
              Text(
                label,
                style: AppText.body(14, weight: FontWeight.w700, color: fg),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
