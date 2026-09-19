import 'package:flutter/material.dart';

import '../../state/app_state.dart';
import '../../widgets/common.dart';
import 'wallet_screen.dart';

/// Full activity feed behind "All" on the wallet home.
class ActivityScreen extends StatelessWidget {
  const ActivityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final txs = context.app.txs;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(title: context.tr('Tất cả hoạt động', 'All activity')),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
                children: [
                  Panel(
                    child: Column(
                      children: [
                        for (final (i, tx) in txs.indexed)
                          TxRow(
                            tx: tx,
                            divider: i < txs.length - 1,
                            onTap: () => openTxDetail(context, tx),
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
    );
  }
}
