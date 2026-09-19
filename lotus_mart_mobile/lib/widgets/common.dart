import 'dart:math';

import 'package:flutter/material.dart';

import '../l10n/format.dart';
import '../state/app_state.dart';
import '../state/models.dart';
import '../theme/tokens.dart';

/// The rounded "L" tile used as the Lotus Mart mark.
class BrandMark extends StatelessWidget {
  const BrandMark({
    super.key,
    this.size = 30,
    this.radius = 9,
    this.letter = 'L',
    this.color,
    this.fontSize = 15,
  });

  final double size;
  final double radius;
  final String letter;
  final Color? color;
  final double fontSize;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    alignment: Alignment.center,
    decoration: BoxDecoration(
      color: color ?? context.brand,
      borderRadius: BorderRadius.circular(radius),
    ),
    child: Text(
      letter,
      style: AppText.display(fontSize, color: Colors.white, trackingEm: 0),
    ),
  );
}

/// Small pill toggling VI ⇄ EN, like the design's header button.
class LangToggle extends StatelessWidget {
  const LangToggle({super.key, this.onDark = false});

  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final fg = onDark ? Colors.white : Palette.ink2;
    return Material(
      color: onDark ? Colors.white.withValues(alpha: 0.15) : Palette.surface,
      shape: StadiumBorder(
        side: BorderSide(color: onDark ? Colors.transparent : Palette.line),
      ),
      child: InkWell(
        customBorder: const StadiumBorder(),
        onTap: app.toggleLang,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          child: Text(
            app.lang == Lang.vi ? 'EN' : 'VI',
            style: AppText.mono(11, color: fg, trackingEm: 0.06),
          ),
        ),
      ),
    );
  }
}

enum Tone {
  info(Palette.info, Palette.infoInk, Icons.info_outline),
  warning(Palette.warning, Palette.warningInk, Icons.hourglass_bottom),
  success(Palette.success, Palette.successInk, Icons.check_circle_outline);

  const Tone(this.base, this.ink, this.icon);

  final Color base;
  final Color ink;
  final IconData icon;

  Color get wash => base.withValues(alpha: 0.12);
  Color get soft => base.withValues(alpha: 0.15);
}

/// Tinted notice box (info / warning).
class Callout extends StatelessWidget {
  const Callout({
    super.key,
    required this.tone,
    required this.body,
    this.title,
    this.fontSize = 13,
  });

  final Tone tone;
  final String? title;
  final String body;
  final double fontSize;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    decoration: BoxDecoration(
      color: tone.wash,
      borderRadius: BorderRadius.circular(Radii.box),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 1),
          child: Icon(tone.icon, size: 17, color: tone.ink),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text.rich(
            TextSpan(
              children: [
                if (title != null)
                  TextSpan(
                    text: '$title\n',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                TextSpan(text: body),
              ],
            ),
            style: AppText.body(fontSize, color: tone.ink, height: 1.45),
          ),
        ),
      ],
    ),
  );
}

class Pill extends StatelessWidget {
  const Pill(
    this.label, {
    super.key,
    required this.background,
    required this.foreground,
    this.fontSize = 11,
  });

  final String label;
  final Color background;
  final Color foreground;
  final double fontSize;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
    decoration: BoxDecoration(
      color: background,
      borderRadius: BorderRadius.circular(Radii.pill),
    ),
    child: Text(
      label,
      style: AppText.body(fontSize, weight: FontWeight.w600, color: foreground),
    ),
  );
}

/// White card with a hairline border: the base container of every list.
class Panel extends StatelessWidget {
  const Panel({
    super.key,
    required this.child,
    this.padding = EdgeInsets.zero,
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(Radii.box),
      side: const BorderSide(color: Palette.line),
    );
    return Material(
      color: Palette.surface,
      shape: shape,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.action,
    this.onAction,
  });

  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      Expanded(child: Text(title, style: AppText.display(15))),
      if (action != null)
        GestureDetector(
          onTap: onAction,
          child: Text(
            action!,
            style: AppText.body(
              12.5,
              weight: FontWeight.w600,
              color: context.brand,
            ),
          ),
        ),
    ],
  );
}

/// Back arrow + title row used by pushed screens.
class ScreenHeader extends StatelessWidget {
  const ScreenHeader({super.key, required this.title, this.trailing});

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(6, 6, 18, 6),
    child: Row(
      children: [
        IconButton(
          onPressed: () => Navigator.of(context).maybePop(),
          icon: const Icon(Icons.arrow_back, color: Palette.ink2, size: 21),
        ),
        const SizedBox(width: 2),
        Expanded(child: Text(title, style: AppText.display(17))),
        ?trailing,
      ],
    ),
  );
}

/// One row of the activity feed.
class TxRow extends StatelessWidget {
  const TxRow({super.key, required this.tx, this.onTap, this.divider = true});

  final Tx tx;
  final VoidCallback? onTap;
  final bool divider;

  @override
  Widget build(BuildContext context) {
    final lang = context.lang;
    final (bg, fg, glyph) = switch (tx.kind) {
      TxKind.earn => (Tone.success.soft, Palette.successInk, '+'),
      TxKind.redeem => (context.brandSoft, context.brand, '−'),
      TxKind.bonus => (
        Palette.gold.withValues(alpha: 0.2),
        Palette.goldInk,
        '×2',
      ),
    };
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: divider
            ? const BoxDecoration(
                border: Border(bottom: BorderSide(color: Palette.line)),
              )
            : null,
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
              child: Text(
                glyph,
                style: AppText.body(
                  glyph.length > 1 ? 12 : 16,
                  weight: FontWeight.w600,
                  color: fg,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tx.title.of(lang),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppText.body(14, weight: FontWeight.w600),
                  ),
                  Text(
                    '${shortDate(tx.at, lang)} · ${tx.store.of(lang)}',
                    style: AppText.mono(11, color: Palette.muted),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              signedPoints(tx.points, lang),
              style: AppText.mono(
                13.5,
                weight: FontWeight.w700,
                color: tx.points >= 0 ? Palette.successText : context.brand,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Diagonal-stripe placeholder, the design's `repeating-linear-gradient(135deg…)`.
class Stripes extends StatelessWidget {
  const Stripes({
    super.key,
    required this.size,
    this.a = Palette.surface2,
    this.b = Palette.stripe,
    this.band = 6,
    this.radius = Radii.field,
    this.child,
  });

  final Size size;
  final Color a;
  final Color b;
  final double band;
  final double radius;
  final Widget? child;

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: BorderRadius.circular(radius),
    child: CustomPaint(
      size: size,
      painter: _StripePainter(a, b, band),
      child: SizedBox.fromSize(size: size, child: child),
    ),
  );
}

class _StripePainter extends CustomPainter {
  _StripePainter(this.a, this.b, this.band);

  final Color a;
  final Color b;
  final double band;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = a);
    final paint = Paint()
      ..color = b
      ..strokeWidth = band;
    final step = band * 2 * sqrt2;
    for (var x = -size.height; x < size.width + size.height; x += step) {
      canvas.drawLine(
        Offset(x, size.height),
        Offset(x + size.height, 0),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_StripePainter old) =>
      old.a != a || old.b != b || old.band != band;
}

/// A QR-looking pattern seeded from the voucher code. Visual only.
class FakeQr extends StatelessWidget {
  const FakeQr({super.key, required this.data, this.size = 150});

  final String data;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    padding: const EdgeInsets.all(8),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(Radii.field),
      border: Border.all(color: Palette.line),
    ),
    child: CustomPaint(painter: _QrPainter(data)),
  );
}

class _QrPainter extends CustomPainter {
  _QrPainter(this.data);

  final String data;
  static const n = 25;

  @override
  void paint(Canvas canvas, Size size) {
    final m = size.width / n;
    final dark = Paint()..color = Palette.ink;
    final light = Paint()..color = Colors.white;
    var seed = 0;
    for (final c in data.codeUnits) {
      seed = (seed * 31 + c) & 0x7fffffff;
    }
    final rng = Random(seed);

    bool inFinder(int x, int y) =>
        (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);

    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        if (!inFinder(x, y) && rng.nextBool()) {
          canvas.drawRect(Rect.fromLTWH(x * m, y * m, m + 0.3, m + 0.3), dark);
        }
      }
    }
    for (final o in [
      Offset.zero,
      Offset((n - 7) * m, 0),
      Offset(0, (n - 7) * m),
    ]) {
      canvas.drawRect(o & Size(7 * m, 7 * m), dark);
      canvas.drawRect((o + Offset(m, m)) & Size(5 * m, 5 * m), light);
      canvas.drawRect((o + Offset(2 * m, 2 * m)) & Size(3 * m, 3 * m), dark);
    }
  }

  @override
  bool shouldRepaint(_QrPainter old) => old.data != data;
}

void showToast(BuildContext context, String message, {SnackBarAction? action}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message), action: action));
}
