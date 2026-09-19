import '../state/models.dart';

const _monthsEn = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const _weekdaysVi = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];
const _weekdaysEn = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/// 2480 → "2.480" (vi) / "2,480" (en). Negative numbers use a true minus sign.
String groupDigits(int n, Lang lang) {
  final digits = n.abs().toString();
  final sep = lang == Lang.vi ? '.' : ',';
  final out = StringBuffer(n < 0 ? '−' : '');
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) out.write(sep);
    out.write(digits[i]);
  }
  return out.toString();
}

String signedPoints(int n, Lang lang) =>
    n >= 0 ? '+${groupDigits(n, lang)}' : groupDigits(n, lang);

String vnd(int amount, Lang lang) => '${groupDigits(amount, lang)} ₫';

/// "19 Th9" / "19 Sep"
String shortDate(DateTime d, Lang lang) => lang == Lang.vi
    ? '${d.day} Th${d.month}'
    : '${d.day} ${_monthsEn[d.month - 1]}';

/// "30 Th11 2026" / "30 Nov 2026"
String fullDate(DateTime d, Lang lang) => '${shortDate(d, lang)} ${d.year}';

String clock(DateTime d) =>
    '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

/// "Thứ Bảy, 19 Th9" / "Saturday, 19 Sep"
String weekdayDate(DateTime d, Lang lang) {
  final names = lang == Lang.vi ? _weekdaysVi : _weekdaysEn;
  return '${names[d.weekday - 1]}, ${shortDate(d, lang)}';
}

String timeAgo(DateTime then, DateTime now, Lang lang) {
  final d = now.difference(then);
  final vi = lang == Lang.vi;
  if (d.inMinutes < 1) return vi ? 'Vừa xong' : 'Just now';
  if (d.inMinutes < 60) {
    return vi ? '${d.inMinutes} phút trước' : '${d.inMinutes}m ago';
  }
  if (d.inHours < 24) {
    return vi ? '${d.inHours} giờ trước' : '${d.inHours}h ago';
  }
  if (d.inDays == 1) return vi ? 'Hôm qua' : 'Yesterday';
  return vi ? '${d.inDays} ngày trước' : '${d.inDays}d ago';
}

/// "+84 901 234 567" → "+84 901 •••• 567"
String maskPhone(String phone) {
  final parts = phone.trim().split(RegExp(r'\s+'));
  if (parts.length < 3) return phone;
  parts[parts.length - 2] = '••••';
  return parts.join(' ');
}
