import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/alert.dart';

class CitizenDashboard extends StatefulWidget {
  const CitizenDashboard({super.key});
  @override
  State<CitizenDashboard> createState() => _CitizenDashboardState();
}

class _CitizenDashboardState extends State<CitizenDashboard> {
  bool _invisibleMode = false;
  List<AppAlert> _alerts = [];
  bool _loadingAlerts = true;
  double _dragStartY = 0;

  @override
  void initState() {
    super.initState();
    _loadAlerts();
  }

  Future<void> _loadAlerts() async {
    try {
      final alerts = await ApiService().getAlerts();
      if (mounted) setState(() { _alerts = alerts; _loadingAlerts = false; });
    } catch (_) {
      if (mounted) setState(() => _loadingAlerts = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user!;
    final bg = _invisibleMode ? const Color(0xFF0F172A) : AppTheme.background;
    final textColor = _invisibleMode ? Colors.white : AppTheme.textPrimary;

    return GestureDetector(
      onVerticalDragStart: (d) => _dragStartY = d.globalPosition.dy,
      onVerticalDragEnd: (d) {
        final delta = d.globalPosition.dy - _dragStartY;
        if (delta < -60) setState(() => _invisibleMode = true);
        if (delta > 60) setState(() => _invisibleMode = false);
      },
      child: Scaffold(
        backgroundColor: bg,
        body: SafeArea(
          child: Column(
            children: [
              // Header
              _buildHeader(user, textColor),
              if (_invisibleMode) _buildInvisibleBanner(),
              // Content
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _loadAlerts,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Quick Actions
                        _buildQuickActions(context),
                        const SizedBox(height: 24),
                        // Alerts
                        Text('Community Alerts',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: textColor)),
                        const SizedBox(height: 12),
                        _buildAlerts(textColor),
                        const SizedBox(height: 16),
                        // Swipe hint
                        if (!_invisibleMode)
                          Center(
                            child: Column(
                              children: [
                                Icon(Icons.keyboard_arrow_up, color: Colors.grey[400]),
                                Text('Swipe up for Invisible Mode',
                                    style: TextStyle(fontSize: 11, color: Colors.grey[400])),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(user, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _invisibleMode ? const Color(0xFF1E293B) : AppTheme.citizenPrimary,
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Text(user.fullName[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hello, ${user.fullName.split(' ')[0]}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                Text(_invisibleMode ? 'Invisible Mode Active' : 'Stay Safe',
                    style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 12)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
    );
  }

  Widget _buildInvisibleBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: const Color(0xFF1E293B),
      child: Row(
        children: [
          const Icon(Icons.visibility_off, size: 14, color: Color(0xFF94A3B8)),
          const SizedBox(width: 8),
          const Expanded(
            child: Text('Invisible Mode — your identity is hidden',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          ),
          GestureDetector(
            onTap: () => setState(() => _invisibleMode = false),
            child: const Text('Exit', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _ActionItem(Icons.sos_rounded, 'SOS', 'Emergency', const Color(0xFFDC2626), () => context.go('/citizen/sos')),
      _ActionItem(Icons.chat_bubble_outline, 'AI Chat', 'Report Crime', AppTheme.citizenPrimary, () => context.go('/citizen/chat')),
      _ActionItem(Icons.folder_open_outlined, 'My Cases', 'Track Reports', const Color(0xFF7C3AED), () => context.go('/citizen/reports')),
      _ActionItem(Icons.security_outlined, 'Safety Tips', 'Stay Informed', const Color(0xFFD97706), () {}),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.4,
      children: actions.map(_buildActionCard).toList(),
    );
  }

  Widget _buildActionCard(_ActionItem item) {
    return GestureDetector(
      onTap: item.onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _invisibleMode ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: _invisibleMode ? const Color(0xFF334155) : AppTheme.border,
          ),
          boxShadow: _invisibleMode ? [] : [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: item.color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(item.icon, color: item.color, size: 22),
            ),
            const Spacer(),
            Text(item.title,
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14,
                    color: _invisibleMode ? Colors.white : AppTheme.textPrimary)),
            Text(item.subtitle,
                style: TextStyle(fontSize: 11, color: _invisibleMode ? const Color(0xFF94A3B8) : AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildAlerts(Color textColor) {
    if (_loadingAlerts) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_alerts.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: _invisibleMode ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _invisibleMode ? const Color(0xFF334155) : AppTheme.border),
        ),
        child: Center(child: Text('No active alerts', style: TextStyle(color: textColor))),
      );
    }
    return Column(
      children: _alerts.map((a) => _buildAlertCard(a, textColor)).toList(),
    );
  }

  Widget _buildAlertCard(AppAlert alert, Color textColor) {
    final severityColor = alert.severity == 'warning'
        ? AppTheme.warning
        : alert.severity == 'danger'
            ? AppTheme.danger
            : AppTheme.policePrimary;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _invisibleMode ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _invisibleMode ? const Color(0xFF334155) : AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 40,
            decoration: BoxDecoration(color: severityColor, borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(alert.title,
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: textColor)),
                const SizedBox(height: 2),
                Text(alert.content,
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    maxLines: 2, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;
  _ActionItem(this.icon, this.title, this.subtitle, this.color, this.onTap);
}
