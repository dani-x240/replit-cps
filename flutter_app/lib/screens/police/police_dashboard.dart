import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/report.dart';
import '../../models/alert.dart';

class PoliceDashboard extends StatefulWidget {
  const PoliceDashboard({super.key});
  @override
  State<PoliceDashboard> createState() => _PoliceDashboardState();
}

class _PoliceDashboardState extends State<PoliceDashboard> {
  List<Report> _reports = [];
  List<AppAlert> _alerts = [];
  bool _loading = true;
  int _selectedTab = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        ApiService().getReports(),
        ApiService().getAlerts(),
      ]);
      if (mounted) {
        setState(() {
          _reports = results[0] as List<Report>;
          _alerts = results[1] as List<AppAlert>;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user!;
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(user),
            _buildStats(),
            _buildTabs(),
            Expanded(child: _buildContent()),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(user) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(color: AppTheme.policePrimary),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.white24,
            child: Text(user.fullName[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user.fullName,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                Text(user.roleLabel,
                    style: const TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
    );
  }

  Widget _buildStats() {
    final submitted = _reports.where((r) => r.status == 'submitted').length;
    final assigned = _reports.where((r) => r.status == 'assigned').length;
    final investigating = _reports.where((r) => r.status == 'under_investigation').length;
    final resolved = _reports.where((r) => r.status == 'resolved').length;

    return Container(
      color: AppTheme.policePrimary,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Row(
        children: [
          _statChip('New', submitted, Colors.white, const Color(0xFFBFDBFE)),
          _statChip('Assigned', assigned, Colors.white, const Color(0xFFBFDBFE)),
          _statChip('Active', investigating, Colors.white, const Color(0xFFBFDBFE)),
          _statChip('Resolved', resolved, Colors.white, const Color(0xFFBFDBFE)),
        ],
      ),
    );
  }

  Widget _statChip(String label, int count, Color textColor, Color bg) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text('$count',
                style: TextStyle(color: textColor, fontSize: 22, fontWeight: FontWeight.w800)),
            Text(label, style: TextStyle(color: textColor.withOpacity(0.8), fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      color: Colors.white,
      child: Row(
        children: [
          _tab(0, 'Cases', Icons.folder_outlined),
          _tab(1, 'Alerts', Icons.notifications_outlined),
        ],
      ),
    );
  }

  Widget _tab(int index, String label, IconData icon) {
    final selected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: selected ? AppTheme.policePrimary : Colors.transparent,
                width: 2,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16,
                  color: selected ? AppTheme.policePrimary : AppTheme.textSecondary),
              const SizedBox(width: 6),
              Text(label, style: TextStyle(
                  color: selected ? AppTheme.policePrimary : AppTheme.textSecondary,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                  fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppTheme.policePrimary));
    return RefreshIndicator(
      onRefresh: _loadData,
      child: _selectedTab == 0 ? _buildCasesList() : _buildAlertsList(),
    );
  }

  Widget _buildCasesList() {
    if (_reports.isEmpty) {
      return const Center(child: Text('No cases found', style: TextStyle(color: AppTheme.textSecondary)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _reports.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) => _buildCaseCard(_reports[i]),
    );
  }

  Widget _buildCaseCard(Report r) {
    return GestureDetector(
      onTap: () => context.go('/police/report/${r.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(r.title,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: r.statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(r.statusLabel,
                      style: TextStyle(color: r.statusColor, fontSize: 11, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(r.description,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 10),
            Row(
              children: [
                if (r.caseNumber != null) ...[
                  const Icon(Icons.tag, size: 12, color: AppTheme.textSecondary),
                  const SizedBox(width: 2),
                  Text(r.caseNumber!,
                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  const SizedBox(width: 10),
                ],
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: r.priorityColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(r.priority.toUpperCase(),
                      style: TextStyle(
                          color: r.priorityColor, fontSize: 10, fontWeight: FontWeight.w700)),
                ),
                const Spacer(),
                Text(r.type.toUpperCase(),
                    style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.textSecondary),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertsList() {
    if (_alerts.isEmpty) {
      return const Center(child: Text('No alerts', style: TextStyle(color: AppTheme.textSecondary)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _alerts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) => _buildAlertCard(_alerts[i]),
    );
  }

  Widget _buildAlertCard(AppAlert a) {
    final color = a.severity == 'warning'
        ? AppTheme.warning
        : a.severity == 'danger'
            ? AppTheme.danger
            : AppTheme.policePrimary;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 4, height: 50,
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(a.title,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 3),
                Text(a.content,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                    maxLines: 2, overflow: TextOverflow.ellipsis),
                if (a.location != null) ...[
                  const SizedBox(height: 4),
                  Row(children: [
                    const Icon(Icons.location_on_outlined, size: 12, color: AppTheme.textSecondary),
                    const SizedBox(width: 2),
                    Text(a.location!, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  ]),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
