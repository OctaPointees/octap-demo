import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../state/models.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';

/// 06 · My vouchers
class MyVouchersScreen extends StatelessWidget {
  const MyVouchersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final now = app.now;
    final active = app.activeVouchers;
    final past = app.vouchers.where((v) => !active.contains(v)).toList();

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(title: context.tr('Voucher của tôi', 'My vouchers')),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 4, 18, 20),
                children: [
                  if (active.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Text(
                        context.tr(
                          'Chưa có voucher nào sẵn sàng.',
                          'No vouchers ready yet.',
                        ),
                        textAlign: TextAlign.center,
                        style: AppText.body(13, color: Palette.muted),
                      ),
                    ),
                  for (final v in active) ...[
                    _ActiveVoucher(voucher: v, now: now),
                    const SizedBox(height: 12),
                    if (v.statusAt(now) == VoucherStatus.expiringSoon) ...[
                      Callout(
                        tone: Tone.warning,
                        title: context.tr(
                          '${v.title.vi} hết hạn sau ${v.expires.difference(now).inDays} ngày',
                          '${v.title.en} expires in ${v.expires.difference(now).inDays} days',
                        ),
                        body: context.tr(
                          'Nhắc lại trước 3 ngày.',
                          "We'll remind you again 3 days before.",
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ],
                  for (final v in past) ...[
                    _PastVoucher(voucher: v, now: now),
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

class _ActiveVoucher extends StatelessWidget {
  const _ActiveVoucher({required this.voucher, required this.now});

  final Voucher voucher;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final lang = context.lang;
    final soon = voucher.statusAt(now) == VoucherStatus.expiringSoon;
    final tone = soon ? Tone.warning : Tone.success;

    return Panel(
      padding: const EdgeInsets.all(18),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  voucher.title.of(lang),
                  style: AppText.body(15, weight: FontWeight.w700),
                ),
              ),
              Pill(
                soon
                    ? context.tr('Sắp hết hạn', 'Expiring')
                    : context.tr('Sẵn sàng', 'Ready'),
                background: tone.soft,
                foreground: tone.ink,
              ),
            ],
          ),
          const SizedBox(height: 10),
          FakeQr(data: voucher.code),
          const SizedBox(height: 10),
          InkWell(
            onTap: () {
              Clipboard.setData(ClipboardData(text: voucher.code));
              showToast(context, context.tr('Đã chép mã.', 'Code copied.'));
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              child: Text(
                voucher.code,
                style: AppText.mono(13, trackingEm: 0.08),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${voucher.partner} · ${context.tr('HSD', 'Exp')} ${fullDate(voucher.expires, lang)}',
            style: AppText.body(12, color: Palette.muted),
          ),
        ],
      ),
    );
  }
}

class _PastVoucher extends StatelessWidget {
  const _PastVoucher({required this.voucher, required this.now});

  final Voucher voucher;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final lang = context.lang;
    final used = voucher.usedAt;
    return Panel(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          const Stripes(size: Size.square(52)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  voucher.title.of(lang),
                  style: AppText.body(14, weight: FontWeight.w700),
                ),
                Text(
                  used != null
                      ? '${voucher.partner} · ${context.tr('Đã dùng', 'Used')} ${shortDate(used, lang)}'
                      : '${voucher.partner} · ${context.tr('Hết hạn', 'Expired')} ${shortDate(voucher.expires, lang)}',
                  style: AppText.body(12, color: Palette.muted),
                ),
              ],
            ),
          ),
          Pill(
            used != null
                ? context.tr('Đã dùng', 'Used')
                : context.tr('Hết hạn', 'Expired'),
            background: const Color(0x10000000),
            foreground: const Color(0x99000000),
          ),
        ],
      ),
    );
  }
}
