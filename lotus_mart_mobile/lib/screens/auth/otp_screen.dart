import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';
import '../shell/home_shell.dart';

/// 02 · Verify OTP. Any 6 digits pass in the demo.
class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  static const _length = 6;
  static const _resendAfter = 30;

  final _code = TextEditingController();
  final _focus = FocusNode();
  Timer? _timer;
  int _secondsLeft = _resendAfter;

  @override
  void initState() {
    super.initState();
    _code.addListener(() => setState(() {}));
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _code.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsLeft = _resendAfter);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft <= 1) t.cancel();
      setState(() => _secondsLeft--);
    });
  }

  void _resend() {
    _startTimer();
    showToast(context, context.tr('Đã gửi lại mã.', 'Code sent again.'));
  }

  void _verify() {
    AppScope.read(context).setTab(0);
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const HomeShell()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final code = _code.text;
    final brand = context.brand;
    final m = _secondsLeft ~/ 60;
    final s = (_secondsLeft % 60).toString().padLeft(2, '0');

    return Scaffold(
      backgroundColor: Palette.surface,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        onPressed: () => Navigator.of(context).maybePop(),
                        icon: const Icon(Icons.arrow_back, color: Palette.ink2),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const SizedBox(height: 14),
                          Text(
                            context.tr(
                              'Nhập mã 6 số',
                              'Enter the 6-digit code',
                            ),
                            style: AppText.display(24, trackingEm: -0.025),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            context.tr(
                              'Mã đã gửi tới ${maskPhone(app.phone)}.',
                              'We sent a code to ${maskPhone(app.phone)}.',
                            ),
                            style: AppText.body(14, color: Palette.ink2),
                          ),
                          const SizedBox(height: 26),
                          _OtpBoxes(
                            controller: _code,
                            focus: _focus,
                            length: _length,
                            brand: brand,
                            onCompleted: _verify,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _secondsLeft > 0
                                    ? Text.rich(
                                        TextSpan(
                                          text: context.tr(
                                            'Gửi lại sau ',
                                            'Resend in ',
                                          ),
                                          children: [
                                            TextSpan(
                                              text: '$m:$s',
                                              style: AppText.mono(
                                                13,
                                                weight: FontWeight.w700,
                                                color: Palette.ink2,
                                              ),
                                            ),
                                          ],
                                        ),
                                        style: AppText.body(
                                          13,
                                          color: Palette.muted,
                                        ),
                                      )
                                    : GestureDetector(
                                        onTap: _resend,
                                        child: Text(
                                          context.tr(
                                            'Gửi lại mã',
                                            'Resend code',
                                          ),
                                          style: AppText.body(
                                            13,
                                            weight: FontWeight.w600,
                                            color: brand,
                                          ),
                                        ),
                                      ),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.of(context).maybePop(),
                                child: Text(
                                  context.tr(
                                    'Đổi số điện thoại',
                                    'Change number',
                                  ),
                                  style: AppText.body(
                                    13,
                                    weight: FontWeight.w600,
                                    color: brand,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 26),
                          Callout(
                            tone: Tone.info,
                            body: context.tr(
                              'OctaP không bao giờ hỏi mã OTP qua điện thoại hay tin nhắn.',
                              'OctaP will never ask for your OTP by phone or message.',
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    const SizedBox(height: 24),
                    Padding(
                      padding: const EdgeInsets.only(left: 12),
                      child: FilledButton(
                        onPressed: code.length == _length ? _verify : null,
                        child: Text(context.tr('Xác nhận', 'Verify')),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Six boxes over one invisible text field, so paste and autofill work.
class _OtpBoxes extends StatelessWidget {
  const _OtpBoxes({
    required this.controller,
    required this.focus,
    required this.length,
    required this.brand,
    required this.onCompleted,
  });

  final TextEditingController controller;
  final FocusNode focus;
  final int length;
  final Color brand;
  final VoidCallback onCompleted;

  @override
  Widget build(BuildContext context) {
    final code = controller.text;
    // As in the mock: the digit just typed is outlined in brand colour.
    final active = code.isEmpty ? 0 : code.length - 1;
    return SizedBox(
      height: 56,
      child: Stack(
        children: [
          Row(
            children: [
              for (var i = 0; i < length; i++) ...[
                if (i > 0) const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(Radii.field),
                      border: i == active
                          ? Border.all(color: brand, width: 2)
                          : Border.all(color: Palette.line),
                    ),
                    child: Text(
                      i < code.length ? code[i] : '',
                      style: AppText.mono(
                        20,
                        weight: FontWeight.w700,
                        color: i == active ? brand : Palette.ink,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
          Positioned.fill(
            child: Opacity(
              opacity: 0,
              child: TextField(
                controller: controller,
                focusNode: focus,
                autofocus: true,
                keyboardType: TextInputType.number,
                autofillHints: const [AutofillHints.oneTimeCode],
                maxLength: length,
                showCursor: false,
                enableInteractiveSelection: false,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                onChanged: (v) {
                  if (v.length == length) onCompleted();
                },
                decoration: const InputDecoration(counterText: ''),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
