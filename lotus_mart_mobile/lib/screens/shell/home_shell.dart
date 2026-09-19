import 'package:flutter/material.dart';

import '../../state/app_state.dart';
import '../../theme/tokens.dart';
import '../earn/earn_screen.dart';
import '../me/me_screen.dart';
import '../rewards/rewards_screen.dart';
import '../wallet/wallet_screen.dart';

/// Signed-in shell with the four-tab bar from the design.
class HomeShell extends StatelessWidget {
  const HomeShell({super.key});

  static const _pages = [
    WalletScreen(),
    EarnScreen(),
    RewardsScreen(),
    MeScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final tab = context.app.tab;
    return Scaffold(
      body: IndexedStack(
        index: tab,
        children: [
          for (var i = 0; i < _pages.length; i++)
            TickerMode(enabled: i == tab, child: _pages[i]),
        ],
      ),
      bottomNavigationBar: const _BottomNav(),
    );
  }
}

class _BottomNav extends StatelessWidget {
  const _BottomNav();

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final items = [
      (Icons.diamond_outlined, context.tr('Ví', 'Wallet')),
      (Icons.qr_code_scanner, context.tr('Tích Sen', 'Earn')),
      (Icons.card_giftcard, context.tr('Đổi quà', 'Rewards')),
      (Icons.person_outline, context.tr('Tôi', 'Me')),
    ];
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: Palette.surface,
        border: Border(top: BorderSide(color: Palette.line)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(10, 6, 10, 8),
          child: Row(
            children: [
              for (var i = 0; i < items.length; i++)
                Expanded(
                  child: _NavItem(
                    icon: items[i].$1,
                    label: items[i].$2,
                    selected: app.tab == i,
                    onTap: () => app.setTab(i),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? context.brand : Palette.muted;
    return Semantics(
      selected: selected,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(Radii.box),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 22, color: color),
              const SizedBox(height: 3),
              Text(
                label,
                style: AppText.body(
                  10.5,
                  weight: selected ? FontWeight.w700 : FontWeight.w400,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
