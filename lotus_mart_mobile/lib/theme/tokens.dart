import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Design tokens lifted from "Lotus Mart Mobile App Screens.html".
/// The brand colour is not here: it is a per-partner setting that lives in
/// [AppState.brand] and reaches widgets through `Theme.of(context)`.
abstract final class Palette {
  static const ground = Color(0xFFFAF7F9);
  static const surface = Color(0xFFFFFFFF);
  static const surface2 = Color(0xFFF3EEF1);
  static const stripe = Color(0xFFECE4E9);
  static const ink = Color(0xFF17111A);
  static const ink2 = Color(0xFF4A3F4C);
  static const muted = Color(0xFF7B6E7C);
  static const line = Color(0xFFE7DFE4);
  static const scanner = Color(0xFF1A1419);
  static const lockTop = Color(0xFF3A2130);

  static const success = Color(0xFF88C057);
  static const successInk = Color(0xFF3F6A12);
  static const successText = Color(0xFF5D8F2C);
  static const warning = Color(0xFFF39C12);
  static const warningInk = Color(0xFF7A4E00);
  static const info = Color(0xFF33BBF6);
  static const infoInk = Color(0xFF05506F);
  static const gold = Color(0xFFE0B53F);
  static const goldInk = Color(0xFF8A6A10);

  /// "Partner theme" options offered by the design file.
  static const brandOptions = [
    Color(0xFF9F0261),
    Color(0xFF8B5A2B),
    Color(0xFF002B49),
    Color(0xFF88C057),
    Color(0xFFFF8C42),
  ];
}

abstract final class Radii {
  /// --rb: 0.7rem
  static const box = 11.2;

  /// --rf: 0.4rem
  static const field = 6.4;
  static const pill = 999.0;
}

/// Figtree for body, Archivo for display, Space Mono for numbers and codes.
abstract final class AppText {
  static TextStyle body(
    double size, {
    FontWeight weight = FontWeight.w400,
    Color? color,
    double? height,
  }) => GoogleFonts.figtree(
    fontSize: size,
    fontWeight: weight,
    color: color,
    height: height,
  );

  static TextStyle display(
    double size, {
    FontWeight weight = FontWeight.w700,
    Color? color,
    double trackingEm = -0.02,
    double height = 1.15,
  }) => GoogleFonts.archivo(
    fontSize: size,
    fontWeight: weight,
    color: color,
    letterSpacing: size * trackingEm,
    height: height,
  );

  static TextStyle mono(
    double size, {
    FontWeight weight = FontWeight.w400,
    Color? color,
    double trackingEm = 0,
  }) => GoogleFonts.spaceMono(
    fontSize: size,
    fontWeight: weight,
    color: color,
    letterSpacing: size * trackingEm,
  );
}

extension BrandColors on BuildContext {
  Color get brand => Theme.of(this).colorScheme.primary;

  /// --brand-soft: brand at ~10% alpha.
  Color get brandSoft => brand.withValues(alpha: 0.1);
}

ThemeData buildTheme(Color brand) {
  final scheme = ColorScheme.fromSeed(
    seedColor: brand,
    primary: brand,
    onPrimary: Colors.white,
    surface: Palette.surface,
    onSurface: Palette.ink,
  );
  final fieldShape = RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(Radii.field),
  );
  OutlineInputBorder border(Color c, [double w = 1]) => OutlineInputBorder(
    borderRadius: BorderRadius.circular(Radii.field),
    borderSide: BorderSide(color: c, width: w),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: Palette.ground,
    dividerColor: Palette.line,
    textTheme: GoogleFonts.figtreeTextTheme().apply(
      bodyColor: Palette.ink,
      displayColor: Palette.ink,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: brand,
        foregroundColor: Colors.white,
        disabledBackgroundColor: brand.withValues(alpha: 0.35),
        disabledForegroundColor: Colors.white,
        minimumSize: const Size(0, 50),
        shape: fieldShape,
        textStyle: AppText.body(15.5, weight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Palette.ink,
        backgroundColor: Palette.surface,
        side: const BorderSide(color: Palette.line),
        minimumSize: const Size(0, 48),
        shape: fieldShape,
        textStyle: AppText.body(14.5, weight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: brand,
        textStyle: AppText.body(13.5, weight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Palette.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: border(Palette.line),
      enabledBorder: border(Palette.line),
      focusedBorder: border(brand, 2),
      errorBorder: border(const Color(0xFFD9383A)),
      focusedErrorBorder: border(const Color(0xFFD9383A), 2),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: Palette.ink,
      contentTextStyle: AppText.body(14, color: Colors.white),
      actionTextColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(Radii.box),
      ),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith(
        (s) => s.contains(WidgetState.selected) ? Colors.white : null,
      ),
      trackColor: WidgetStateProperty.resolveWith(
        (s) => s.contains(WidgetState.selected) ? brand : null,
      ),
    ),
  );
}
