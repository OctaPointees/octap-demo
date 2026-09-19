import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../state/models.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';
import '../wallet/wallet_screen.dart';

/// 04 · Earn points — scan the cashier's QR or type the code on the bill.
class EarnScreen extends StatefulWidget {
  const EarnScreen({super.key});

  @override
  State<EarnScreen> createState() => _EarnScreenState();
}

class _EarnScreenState extends State<EarnScreen> {
  final _code = TextEditingController(text: 'LTM-4K29-8842');
  bool _torch = false;
  String? _error;

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  void _claim() {
    final app = AppScope.read(context);
    FocusScope.of(context).unfocus();
    try {
      final tx = app.claimBillCode(_code.text);
      setState(() => _error = null);
      _code.clear();
      showToast(
        context,
        context.tr(
          '${signedPoints(tx.points, Lang.vi)} Sen đã được cộng vào ví.',
          '${signedPoints(tx.points, Lang.en)} Petals added to your wallet.',
        ),
        action: SnackBarAction(
          label: context.tr('Xem', 'View'),
          onPressed: () => openTxDetail(context, tx),
        ),
      );
    } on ClaimException catch (e) {
      setState(
        () => _error = switch (e.error) {
          ClaimError.invalid => context.tr(
            'Mã có dạng LTM-XXXX-0000.',
            'Codes look like LTM-XXXX-0000.',
          ),
          ClaimError.used => context.tr(
            'Mã này đã được dùng.',
            'This code has already been used.',
          ),
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final white70 = Colors.white.withValues(alpha: 0.7);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: ColoredBox(
        color: Palette.scanner,
        child: SafeArea(
          bottom: false,
          child: CustomScrollView(
            slivers: [
              SliverFillRemaining(
                hasScrollBody: false,
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
                      child: Row(
                        children: [
                          IconButton(
                            tooltip: context.tr('Đóng', 'Close'),
                            onPressed: () => app.setTab(0),
                            icon: const Icon(Icons.close, color: Colors.white),
                          ),
                          Expanded(
                            child: Text(
                              context.tr(
                                'Quét mã tại quầy',
                                'Scan at checkout',
                              ),
                              textAlign: TextAlign.center,
                              style: AppText.body(
                                15,
                                weight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          IconButton(
                            tooltip: context.tr('Đèn', 'Torch'),
                            onPressed: () => setState(() => _torch = !_torch),
                            icon: Icon(
                              _torch ? Icons.flash_on : Icons.flash_off,
                              color: _torch ? Palette.warning : white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Expanded(child: Center(child: _Viewfinder())),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        context.tr(
                          'Đưa mã QR trên màn hình thu ngân vào khung. Sen được cộng ngay sau khi giao dịch lên chuỗi.',
                          "Line up the cashier's QR inside the frame. Petals land as soon as the transaction is on chain.",
                        ),
                        textAlign: TextAlign.center,
                        style: AppText.body(
                          13.5,
                          color: Colors.white.withValues(alpha: 0.82),
                        ),
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.fromLTRB(18, 22, 18, 20),
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Palette.surface,
                        borderRadius: BorderRadius.circular(19.2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            context.tr(
                              'Hoặc nhập mã trên hoá đơn',
                              'Or enter the code on your bill',
                            ),
                            style: AppText.body(14, weight: FontWeight.w700),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _code,
                                  textCapitalization:
                                      TextCapitalization.characters,
                                  textInputAction: TextInputAction.done,
                                  onSubmitted: (_) => _claim(),
                                  style: AppText.mono(14, trackingEm: 0.06),
                                  decoration: InputDecoration(
                                    isDense: true,
                                    hintText: 'LTM-XXXX-0000',
                                    errorText: _error,
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 13,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              FilledButton(
                                onPressed: _claim,
                                style: FilledButton.styleFrom(
                                  minimumSize: const Size(0, 46),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                  ),
                                  textStyle: AppText.body(
                                    14,
                                    weight: FontWeight.w600,
                                  ),
                                ),
                                child: Text(context.tr('Cộng', 'Add')),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            context.tr(
                              'Mã in ở cuối hoá đơn, dùng được trong 7 ngày.',
                              'Printed at the bottom of your receipt, valid 7 days.',
                            ),
                            style: AppText.body(12, color: Palette.muted),
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
    );
  }
}

/// Striped QR frame with corner brackets and a sweeping scan line.
class _Viewfinder extends StatefulWidget {
  const _Viewfinder();

  @override
  State<_Viewfinder> createState() => _ViewfinderState();
}

class _ViewfinderState extends State<_Viewfinder>
    with SingleTickerProviderStateMixin {
  late final _sweep = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2200),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _sweep.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const side = 236.0;
    return Container(
      width: side,
      height: side,
      margin: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.35),
          width: 2,
        ),
      ),
      child: Stripes(
        size: const Size.square(side - 4),
        radius: 22,
        band: 10,
        a: Colors.white.withValues(alpha: 0.02),
        b: Colors.white.withValues(alpha: 0.06),
        child: Stack(
          children: [
            Center(
              child: Text(
                context.tr('VÙNG QUÉT QR', 'QR VIEWFINDER'),
                style: AppText.mono(
                  10.5,
                  color: Colors.white.withValues(alpha: 0.65),
                  trackingEm: 0.08,
                ),
              ),
            ),
            AnimatedBuilder(
              animation: _sweep,
              builder: (_, _) => Positioned(
                left: 18,
                right: 18,
                top:
                    18 + (side - 40) * Curves.easeInOut.transform(_sweep.value),
                child: Container(
                  height: 2,
                  decoration: BoxDecoration(
                    color: context.brand,
                    boxShadow: [
                      BoxShadow(color: context.brand, blurRadius: 10),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
