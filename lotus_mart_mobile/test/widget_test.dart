import 'package:flutter_test/flutter_test.dart';
import 'package:lotus_mart_mobile/l10n/format.dart';
import 'package:lotus_mart_mobile/state/app_state.dart';
import 'package:lotus_mart_mobile/state/models.dart';

void main() {
  group('format', () {
    test('groups digits per language', () {
      expect(groupDigits(2480, Lang.vi), '2.480');
      expect(groupDigits(2480, Lang.en), '2,480');
      expect(groupDigits(-800, Lang.en), '−800');
      expect(signedPoints(52, Lang.en), '+52');
    });

    test('masks the middle phone group', () {
      expect(maskPhone('+84 901 234 567'), '+84 901 •••• 567');
    });
  });

  group('AppState', () {
    test('starts at Gold, 31% of the way to Platinum', () {
      final app = AppState();
      expect(app.balance, 2480);
      expect(app.tier, Tier.gold);
      expect(app.pointsToNextTier, 5520);
      expect((app.tierProgress * 100).round(), 31);
    });

    test('claims a bill code once', () {
      final app = AppState();
      final tx = app.claimBillCode('ltm-4k29-8842');
      expect(tx.points, 88);
      expect(app.balance, 2480 + 88);
      expect(app.txs.first, tx);
      expect(
        () => app.claimBillCode('LTM-4K29-8842'),
        throwsA(
          isA<ClaimException>().having(
            (e) => e.error,
            'error',
            ClaimError.used,
          ),
        ),
      );
      expect(
        () => app.claimBillCode('nope'),
        throwsA(
          isA<ClaimException>().having(
            (e) => e.error,
            'error',
            ClaimError.invalid,
          ),
        ),
      );
    });

    test('redeeming debits Petals and issues a voucher', () {
      final app = AppState();
      final cinema = app.rewards.firstWhere((r) => r.id == 'r-cinema');
      final before = app.vouchers.length;
      final v = app.redeem(cinema);
      expect(app.balance, 2480 - 800);
      expect(app.vouchers.length, before + 1);
      expect(v.code, startsWith('LUM-'));
      expect(app.txs.first.points, -800);
    });

    test('cannot redeem beyond the balance', () {
      final app = AppState();
      final hamper = app.rewards.firstWhere((r) => r.id == 'r-hamper');
      expect(() => app.redeem(hamper), throwsStateError);
      expect(app.balance, 2480);
    });
  });
}
