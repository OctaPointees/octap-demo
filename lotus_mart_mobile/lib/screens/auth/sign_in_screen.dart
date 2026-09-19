import 'package:flutter/material.dart';

import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';
import 'otp_screen.dart';

/// 01 · Sign in (guest)
class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  late final _phone = TextEditingController(text: AppScope.read(context).phone);
  String? _error;

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  void _sendOtp() {
    final digits = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 9) {
      setState(
        () => _error = context.tr(
          'Số điện thoại chưa hợp lệ.',
          'That phone number looks incomplete.',
        ),
      );
      return;
    }
    setState(() => _error = null);
    AppScope.read(context).phone = _phone.text.trim();
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const OtpScreen()));
  }

  void _notInDemo() => showToast(
    context,
    context.tr(
      'Bản demo chỉ hỗ trợ đăng nhập bằng số điện thoại.',
      'This demo only signs in by phone.',
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Palette.surface,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        const BrandMark(),
                        const SizedBox(width: 8),
                        Text('Lotus Mart', style: AppText.display(17)),
                        const Spacer(),
                        const LangToggle(),
                      ],
                    ),
                    const SizedBox(height: 34),
                    Text(
                      context.tr(
                        'Điểm của bạn, minh bạch.',
                        'Your points, in the open.',
                      ),
                      style: AppText.display(
                        27,
                        trackingEm: -0.03,
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      context.tr(
                        'Đăng nhập để xem số dư Sen và voucher đã đổi.',
                        'Sign in to see your Petal balance and vouchers.',
                      ),
                      style: AppText.body(14, color: Palette.ink2),
                    ),
                    const SizedBox(height: 26),
                    Text(
                      context.tr('Số điện thoại', 'Phone number'),
                      style: AppText.body(12.5, weight: FontWeight.w600),
                    ),
                    const SizedBox(height: 5),
                    TextField(
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendOtp(),
                      style: AppText.body(15),
                      decoration: InputDecoration(errorText: _error),
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: _sendOtp,
                      child: Text(context.tr('Gửi mã OTP', 'Send OTP code')),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(0, 22, 0, 18),
                      child: Row(
                        children: [
                          const Expanded(child: Divider(color: Palette.line)),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              context.tr('hoặc', 'or'),
                              style: AppText.body(12, color: Palette.muted),
                            ),
                          ),
                          const Expanded(child: Divider(color: Palette.line)),
                        ],
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: _notInDemo,
                      icon: Text(
                        'G',
                        style: AppText.display(16, color: context.brand),
                      ),
                      label: Text(
                        context.tr(
                          'Tiếp tục với Google',
                          'Continue with Google',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: _notInDemo,
                      icon: const Icon(Icons.mail_outline, size: 18),
                      label: Text(
                        context.tr('Email và mật khẩu', 'Email and password'),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: TextButton(
                        onPressed: _notInDemo,
                        child: Text(
                          context.tr('Quên mật khẩu?', 'Forgot password?'),
                        ),
                      ),
                    ),
                    const Spacer(),
                    const SizedBox(height: 16),
                    Text(
                      context.tr(
                        'Tài khoản dùng chung cho mọi thương hiệu trong mạng lưới OctaP.',
                        'One account across every brand in the OctaP network.',
                      ),
                      textAlign: TextAlign.center,
                      style: AppText.body(11.5, color: Palette.muted),
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
