import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../state/models.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';
import 'my_vouchers_screen.dart';

/// 05 · Convert Petals to a voucher.
class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  Network? _filter;

  void _openVouchers() => Navigator.of(
    context,
  ).push(MaterialPageRoute(builder: (_) => const MyVouchersScreen()));

  Future<void> _get(Reward reward) async {
    final app = AppScope.read(context);
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      elevation: 0,
      builder: (_) => _ConfirmSheet(reward: reward),
    );
    if (confirmed != true || !mounted) return;

    app.redeem(reward);
    showToast(
      context,
      context.tr('Đã đổi ${reward.title.vi}.', '${reward.title.en} redeemed.'),
      action: SnackBarAction(
        label: context.tr('Xem voucher', 'View voucher'),
        onPressed: _openVouchers,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lang = app.lang;
    final rewards = app.rewards
        .where((r) => _filter == null || r.network == _filter)
        .toList();
    final ready = app.activeVouchers.length;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      context.tr('Đổi quà', 'Rewards'),
                      style: AppText.display(18),
                    ),
                  ),
                  Text(
                    context.tr(
                      '${groupDigits(app.balance, lang)} Sen',
                      '${groupDigits(app.balance, lang)} Petals',
                    ),
                    style: AppText.mono(12.5, color: context.brand),
                  ),
                ],
              ),
            ),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
              child: Row(
                children: [
                  _Chip(
                    label: context.tr('Tất cả', 'All'),
                    selected: _filter == null,
                    onTap: () => setState(() => _filter = null),
                  ),
                  for (final n in Network.values) ...[
                    const SizedBox(width: 8),
                    _Chip(
                      label: n.label,
                      selected: _filter == n,
                      onTap: () => setState(() => _filter = n),
                    ),
                  ],
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 0, 18, 20),
                children: [
                  Panel(
                    onTap: _openVouchers,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.confirmation_number_outlined,
                          color: context.brand,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            context.tr('Voucher của tôi', 'My vouchers'),
                            style: AppText.body(14, weight: FontWeight.w600),
                          ),
                        ),
                        Text(
                          context.tr('$ready sẵn sàng', '$ready ready'),
                          style: AppText.body(12.5, color: Palette.muted),
                        ),
                        const Icon(Icons.chevron_right, color: Palette.muted),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  for (final r in rewards) ...[
                    _RewardCard(
                      reward: r,
                      balance: app.balance,
                      onGet: () => _get(r),
                    ),
                    const SizedBox(height: 10),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
    color: selected ? context.brand : Palette.surface,
    shape: StadiumBorder(
      side: selected ? BorderSide.none : const BorderSide(color: Palette.line),
    ),
    child: InkWell(
      customBorder: const StadiumBorder(),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Text(
          label,
          style: AppText.body(
            12,
            weight: selected ? FontWeight.w600 : FontWeight.w400,
            color: selected ? Colors.white : Palette.ink2,
          ),
        ),
      ),
    ),
  );
}

class _RewardCard extends StatelessWidget {
  const _RewardCard({
    required this.reward,
    required this.balance,
    required this.onGet,
  });

  final Reward reward;
  final int balance;
  final VoidCallback onGet;

  @override
  Widget build(BuildContext context) {
    final lang = context.lang;
    final short = reward.cost - balance;
    final locked = short > 0;

    return Opacity(
      opacity: locked ? 0.85 : 1,
      child: Panel(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const Stripes(size: Size.square(64)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    reward.title.of(lang),
                    style: AppText.body(14, weight: FontWeight.w700),
                  ),
                  Text(
                    locked
                        ? context.tr(
                            'Thiếu ${groupDigits(short, lang)} Sen',
                            '${groupDigits(short, lang)} Petals short',
                          )
                        : reward.partner,
                    style: AppText.body(12, color: Palette.muted),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    groupDigits(reward.cost, lang),
                    style: AppText.mono(13, color: context.brand),
                  ),
                ],
              ),
            ),
            if (locked)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Icon(Icons.lock_outline, size: 18, color: Palette.muted),
              )
            else
              FilledButton(
                onPressed: onGet,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(0, 34),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  textStyle: AppText.body(13, weight: FontWeight.w600),
                ),
                child: Text(context.tr('Đổi', 'Get')),
              ),
          ],
        ),
      ),
    );
  }
}

class _ConfirmSheet extends StatelessWidget {
  const _ConfirmSheet({required this.reward});

  final Reward reward;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lang = app.lang;
    final after = app.balance - reward.cost;

    return SafeArea(
      child: Container(
        margin: const EdgeInsets.fromLTRB(14, 12, 14, 16),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Palette.surface,
          border: Border.all(color: Palette.line),
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(22.4),
            bottom: Radius.circular(16),
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x4017111A),
              blurRadius: 32,
              offset: Offset(0, -12),
              spreadRadius: -22,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 38,
                height: 4,
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: Palette.line,
                  borderRadius: BorderRadius.circular(Radii.pill),
                ),
              ),
            ),
            Text(
              context.tr(
                'Đổi ${groupDigits(reward.cost, lang)} Sen lấy ${reward.title.vi}?',
                'Spend ${groupDigits(reward.cost, lang)} Petals on ${reward.title.en}?',
              ),
              style: AppText.display(16),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      context.tr('Số dư sau khi đổi', 'Balance after'),
                      style: AppText.body(13, color: Palette.ink2),
                    ),
                  ),
                  Text(
                    context.tr(
                      '${groupDigits(after, lang)} Sen',
                      '${groupDigits(after, lang)} Petals',
                    ),
                    style: AppText.mono(
                      13,
                      weight: FontWeight.w700,
                      color: Palette.ink2,
                    ),
                  ),
                ],
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, false),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 46),
                    ),
                    child: Text(context.tr('Huỷ', 'Cancel')),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: FilledButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 46),
                      textStyle: AppText.body(14, weight: FontWeight.w600),
                    ),
                    child: Text(context.tr('Xác nhận đổi', 'Confirm')),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
