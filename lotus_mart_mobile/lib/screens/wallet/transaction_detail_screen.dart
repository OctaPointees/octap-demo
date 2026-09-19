import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../state/models.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';

/// 07 · Verify integrity — every wallet transaction opens this screen.
class TransactionDetailScreen extends StatelessWidget {
  const TransactionDetailScreen({super.key, required this.tx});

  final Tx tx;

  Uri get _explorerUrl =>
      Uri.parse('https://suiscan.xyz/mainnet/tx/${tx.digest}');

  Future<void> _openExplorer(BuildContext context) async {
    final failed = context.tr(
      'Không mở được trình duyệt.',
      'Could not open the browser.',
    );
    final ok = await launchUrl(
      _explorerUrl,
      mode: LaunchMode.externalApplication,
    );
    if (!ok && context.mounted) showToast(context, failed);
  }

  void _copyDigest(BuildContext context) {
    Clipboard.setData(ClipboardData(text: tx.digest));
    showToast(context, context.tr('Đã chép digest.', 'Digest copied.'));
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.lang;
    final (pillBg, pillFg) = switch (tx.kind) {
      TxKind.earn => (Tone.success.soft, Palette.successInk),
      TxKind.redeem => (context.brandSoft, context.brand),
      TxKind.bonus => (Palette.gold.withValues(alpha: 0.2), Palette.goldInk),
    };

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(
              title: context.tr('Chi tiết giao dịch', 'Transaction detail'),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 4, 18, 14),
                children: [
                  Panel(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            color: Tone.success.soft,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            color: Palette.successInk,
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          context.tr(
                            'Đã xác thực on-chain',
                            'Verified on-chain',
                          ),
                          style: AppText.display(20),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          context.tr(
                            'Bản ghi khớp với dữ liệu trên Sui và chưa từng bị sửa.',
                            'The record matches Sui and has never been altered.',
                          ),
                          textAlign: TextAlign.center,
                          style: AppText.body(13, color: Palette.ink2),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Panel(
                    padding: const EdgeInsets.all(16),
                    child: DefaultTextStyle(
                      style: AppText.body(13, color: Palette.ink),
                      child: Column(
                        children: [
                          _Row(
                            context.tr('Loại', 'Type'),
                            Pill(
                              tx.kind.label.of(lang),
                              background: pillBg,
                              foreground: pillFg,
                              fontSize: 11.5,
                            ),
                          ),
                          _Row(
                            context.tr('Số Sen', 'Petals'),
                            Text(
                              signedPoints(tx.points, lang),
                              style: AppText.mono(
                                13,
                                weight: FontWeight.w700,
                                color: tx.points >= 0
                                    ? Palette.successText
                                    : context.brand,
                              ),
                            ),
                          ),
                          _Row(
                            context.tr('Thời gian', 'Time'),
                            Text(
                              '${shortDate(tx.at, lang)}, ${clock(tx.at)}',
                              style: AppText.mono(13),
                            ),
                          ),
                          _Row(
                            context.tr('Cửa hàng', 'Store'),
                            Text(tx.store.of(lang)),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 5),
                            child: Divider(height: 1, color: Palette.line),
                          ),
                          _Row(
                            'Digest',
                            InkWell(
                              onTap: () => _copyDigest(context),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(tx.shortDigest, style: AppText.mono(12)),
                                  const SizedBox(width: 4),
                                  const Icon(
                                    Icons.copy,
                                    size: 13,
                                    color: Palette.muted,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          _Row(
                            'Checkpoint',
                            Text(
                              groupDigits(tx.checkpoint, Lang.en),
                              style: AppText.mono(12),
                            ),
                          ),
                          _Row(
                            context.tr('Phí mạng', 'Network fee'),
                            Text(
                              context.tr(
                                '0,0031 SUI · Lotus trả',
                                '0.0031 SUI · sponsored',
                              ),
                              style: AppText.mono(12),
                            ),
                            last: true,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () => _openExplorer(context),
                    child: Text(
                      context.tr(
                        'Mở trên Sui Explorer ↗',
                        'Open in Sui Explorer ↗',
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    context.tr(
                      'Bạn có thể đối chiếu độc lập mà không cần tin vào hệ thống của cửa hàng.',
                      "You can check this independently, without trusting the store's system.",
                    ),
                    style: AppText.body(12, color: Palette.muted),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
              child: Callout(
                tone: Tone.info,
                fontSize: 12.5,
                body: context.tr(
                  'Mọi giao dịch trong ví đều mở được màn hình này.',
                  'Every wallet transaction opens this screen.',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row(this.label, this.value, {this.last = false});

  final String label;
  final Widget value;
  final bool last;

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.only(bottom: last ? 0 : 11),
    child: Row(
      children: [
        Text(label, style: AppText.body(13, color: Palette.muted)),
        const SizedBox(width: 12),
        const Spacer(),
        value,
      ],
    ),
  );
}
