import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'theme/app_theme.dart';
import 'screens/login_screen.dart';
import 'screens/citizen/citizen_dashboard.dart';
import 'screens/citizen/citizen_sos.dart';
import 'screens/citizen/citizen_chat.dart';
import 'screens/citizen/citizen_reports.dart';
import 'screens/police/police_dashboard.dart';
import 'screens/police/report_detail_screen.dart';
import 'widgets/auto_fit_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider()..checkSession(),
      child: const _AppRoot(),
    ),
  );
}

// Separate router holder so it's built once and refreshes on auth changes
class _AppRoot extends StatefulWidget {
  const _AppRoot();
  @override
  State<_AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<_AppRoot> {
  late GoRouter _router;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _router = GoRouter(
      initialLocation: '/login',
      refreshListenable: auth,
      redirect: (context, state) {
        final loggedIn = auth.isLoggedIn;
        final onLogin = state.matchedLocation == '/login';
        if (!loggedIn && !onLogin) return '/login';
        if (loggedIn && onLogin) {
          final user = auth.user!;
          if (user.isCitizen) return '/citizen';
          return '/police';
        }
        return null;
      },
      routes: [
        GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
        GoRoute(path: '/citizen', builder: (_, __) => const CitizenDashboard()),
        GoRoute(path: '/citizen/sos', builder: (_, __) => const CitizenSosScreen()),
        GoRoute(path: '/citizen/chat', builder: (_, __) => const CitizenChatScreen()),
        GoRoute(path: '/citizen/reports', builder: (_, __) => const CitizenReportsScreen()),
        GoRoute(path: '/police', builder: (_, __) => const PoliceDashboard()),
        GoRoute(
          path: '/police/report/:id',
          builder: (_, state) =>
              ReportDetailScreen(reportId: state.pathParameters['id']!),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isPolice = auth.user?.isPolice == true || auth.user?.isAdmin == true;

    return MaterialApp.router(
      title: 'CPS Mobile',
      theme: isPolice ? AppTheme.policeTheme() : AppTheme.citizenTheme(),
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        return AutoFitScreen(
          designSize: const Size(390, 844),
          child: child ?? const SizedBox(),
        );
      },
    );
  }
}
