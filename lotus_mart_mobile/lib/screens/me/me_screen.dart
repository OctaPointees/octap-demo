import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../state/models.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';
import '../auth/sign_in_screen.dart';
import 'notifications_screen.dart';

/// "Me" tab. Not drawn in the design file; it hosts the settings the design
/// refers to (language, partner theme, per-type notification opt-out).
class MeScreen extends StatelessWidget {
  const MeScreen({super.key});

  void _signOut(BuildContext context) {
    AppScope.read(context).signOut();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const SignInScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lang = app.lang;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
          children: [
            Text(context.tr('Tôi', 'Me'), style: AppText.display(18)),
            const SizedBox(height: 14),
            Panel(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: context.brandSoft,
                    child: Text(
                      'MA',
                      style: AppText.display(
                        16,
                        color: context.brand,
                        trackingEm: 0,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          app.name,
                          style: AppText.body(16, weight: FontWeight.w700),
                        ),
                        Text(
                          maskPhone(app.phone),
                          style: AppText.mono(12, color: Palette.muted),
                        ),
                      ],
                    ),
                  ),
                  Pill(
                    lang == Lang.vi
                        ? 'Hạng ${app.tier.label.vi}'
                        : app.tier.label.en,
                    background: Palette.gold.withValues(alpha: 0.2),
                    foreground: Palette.goldInk,
                    fontSize: 11.5,
                  ),
                ],
              ),
            ),
            _Label(context.tr('Ngôn ngữ', 'Language')),
            SegmentedButton<Lang>(
              showSelectedIcon: false,
              segments: const [
                ButtonSegment(value: Lang.vi, label: Text('Tiếng Việt')),
                ButtonSegment(value: Lang.en, label: Text('English')),
              ],
              selected: {lang},
              onSelectionChanged: (s) => app.setLang(s.first),
            ),
            _Label(
              context.tr('Màu thương hiệu đối tác', 'Partner brand colour'),
            ),
            Panel(
              padding: const EdgeInsets.all(14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  for (final c in Palette.brandOptions)
                    _Swatch(
                      color: c,
                      selected: c == app.brand,
                      onTap: () => app.setBrand(c),
                    ),
                ],
              ),
            ),
            _Label(context.tr('Thông báo', 'Notifications')),
            Panel(
              child: Column(
                children: [
                  for (final (i, kind) in NotificationKind.values.indexed)
                    Container(
                      decoration: i < NotificationKind.values.length - 1
                          ? const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(color: Palette.line),
                              ),
                            )
                          : null,
                      child: SwitchListTile(
                        value: app.notificationPrefs[kind]!,
                        onChanged: (on) => app.setNotificationPref(kind, on),
                        title: Text(
                          kind.label.of(lang),
                          style: AppText.body(14, weight: FontWeight.w600),
                        ),
                        subtitle: Text(
                          kind.hint.of(lang),
                          style: AppText.body(12, color: Palette.muted),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Panel(
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  Icon(
                    Icons.notifications_none,
                    color: context.brand,
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      context.tr(
                        'Xem thông báo gần đây',
                        'See recent notifications',
                      ),
                      style: AppText.body(14, weight: FontWeight.w600),
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Palette.muted),
                ],
              ),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => _signOut(context),
              child: Text(context.tr('Đăng xuất', 'Sign out')),
            ),
          ],
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(2, 22, 0, 8),
    child: Text(
      text.toUpperCase(),
      style: AppText.mono(11, color: Palette.muted, trackingEm: 0.08),
    ),
  );
}

class _Swatch extends StatelessWidget {
  const _Swatch({
    required this.color,
    required this.selected,
    required this.onTap,
  });

  final Color color;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 160),
      width: 40,
      height: 40,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: selected ? color : Colors.transparent,
          width: 2,
        ),
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        child: selected
            ? const Icon(Icons.check, size: 16, color: Colors.white)
            : null,
      ),
    ),
  );
}
