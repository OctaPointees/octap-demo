import 'package:flutter/material.dart';

import 'screens/auth/sign_in_screen.dart';
import 'state/app_state.dart';
import 'theme/tokens.dart';

void main() => runApp(LotusMartApp(state: AppState()));

class LotusMartApp extends StatelessWidget {
  const LotusMartApp({super.key, required this.state});

  final AppState state;

  @override
  Widget build(BuildContext context) {
    return AppScope(
      state: state,
      child: ListenableBuilder(
        listenable: state,
        builder: (context, _) => MaterialApp(
          title: 'Lotus Mart',
          debugShowCheckedModeBanner: false,
          theme: buildTheme(state.brand),
          home: const SignInScreen(),
        ),
      ),
    );
  }
}
