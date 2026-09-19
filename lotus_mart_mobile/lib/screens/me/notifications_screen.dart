import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../l10n/format.dart';
import '../../state/app_state.dart';
import '../../state/models.dart';
import '../../theme/tokens.dart';
import '../../widgets/common.dart';

/// 08 · Notifications — expiry and sales, shown as a lock-screen stack.
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lang = app.lang;
    final now = app.now;
    final items = app.visibleNotifications;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment(-0.17, -1),
              end: Alignment(0.17, 1),
              colors: [Palette.lockTop, Palette.ink],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: IconButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                  ),
                  Text(
                    clock(now),
                    style: AppText.display(
                      56,
                      weight: FontWeight.w600,
                      color: Colors.white,
                      trackingEm: -0.03,
                    ),
                  ),
                  Text(
                    weekdayDate(now, lang),
                    style: AppText.body(
                      13,
                      color: Colors.white.withValues(alpha: 0.72),
                    ),
                  ),
                  const SizedBox(height: 30),
                  Expanded(
                    child: items.isEmpty
                        ? Center(
                            child: Text(
                              context.tr(
                                'Bạn đã tắt mọi loại thông báo.',
                                'All notification types are off.',
                              ),
                              style: AppText.body(
                                13,
                                color: Colors.white.withValues(alpha: 0.72),
                              ),
                            ),
                          )
                        : ListView.separated(
                            itemCount: items.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(height: 10),
                            itemBuilder: (_, i) => _Card(
                              item: items[i],
                              now: now,
                              dim: i == items.length - 1 && items.length > 2,
                            ),
                          ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      context.tr(
                        'Người dùng bật/tắt từng loại thông báo trong mục Tôi.',
                        'Each notification type is opt-out under "Me".',
                      ),
                      textAlign: TextAlign.center,
                      style: AppText.body(
                        11.5,
                        color: Colors.white.withValues(alpha: 0.6),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.item, required this.now, required this.dim});

  final AppNotification item;
  final DateTime now;
  final bool dim;

  @override
  Widget build(BuildContext context) {
    final lang = context.lang;
    final glass = Colors.white.withValues(alpha: dim ? 0.08 : 0.12);
    final lotus = item.network == Network.lotus;

    return ClipRRect(
      borderRadius: BorderRadius.circular(17.6),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: glass,
            borderRadius: BorderRadius.circular(17.6),
            border: Border.all(color: glass),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              BrandMark(
                size: 34,
                letter: lotus ? 'L' : 'O',
                color: lotus ? null : Palette.info,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DefaultTextStyle(
                  style: AppText.body(13, color: Colors.white),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Opacity(
                        opacity: 0.72,
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                item.network.label,
                                style: AppText.body(11.5, color: Colors.white),
                              ),
                            ),
                            Text(
                              timeAgo(item.at, now, lang),
                              style: AppText.body(11.5, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        item.title.of(lang),
                        style: AppText.body(
                          14,
                          weight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      Opacity(opacity: 0.85, child: Text(item.body.of(lang))),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
