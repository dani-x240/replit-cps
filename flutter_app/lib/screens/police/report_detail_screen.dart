import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/report.dart';

class ReportDetailScreen extends StatefulWidget {
  final String reportId;
  const ReportDetailScreen({super.key, required this.reportId});
  @override
  State<ReportDetailScreen> createState() => _ReportDetailScreenState();
}

class _ReportDetailScreenState extends State<ReportDetailScreen> {
  Report? _report;
  List<Map<String, dynamic>> _timeline = [];
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true;
  int _tab = 0;
  final _msgCtrl = TextEditingController();
  bool _sendingMsg = false;
  String _updatingStatus = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final id = int.tryParse(widget.reportId) ?? 0;
    try {
      final results = await Future.wait([
        ApiService().getTimeline(id),
        ApiService().getMessages(id),
        ApiService().getReports(),
      ]);
      final reports = results[2] as List<Report>;
      if (mounted) {
        setState(() {
          _timeline = results[0] as List<Map<String, dynamic>>;
          _messages = results[1] as List<Map<String, dynamic>>;
          _report = reports.firstWhere((r) => r.id == id, orElse: () => reports.first);
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _updateStatus(String status) async {
    final id = int.tryParse(widget.reportId) ?? 0;
    setState(() => _updatingStatus = status);
    try {
      final updated = await ApiService().updateReport(id, {'status': status});
      if (mounted) {
        setState(() { _report = updated; _updatingStatus = ''; });
        _load();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status updated to ${updated.statusLabel}'),
              backgroundColor: AppTheme.success),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _updatingStatus = '');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.danger),
        );
      }
    }
  }

  Future<void> _sendMessage() async {
    final id = int.tryParse(widget.reportId) ?? 0;
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() => _sendingMsg = true);
    try {
      await ApiService().sendMessage(id, text);
      _msgCtrl.clear();
      final msgs = await ApiService().getMessages(id);
      if (mounted) setState(() { _messages = msgs; _sendingMsg = false; });
    } catch (_) {
      if (mounted) setState(() => _sendingMsg = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user!;
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.policePrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: Text(_report?.caseNumber ?? 'Case Detail'),
        actions: [
          if (_report != null)
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, color: Colors.white),
              onSelected: _updateStatus,
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'assigned', child: Text('Mark Assigned')),
                PopupMenuItem(value: 'under_investigation', child: Text('Under Investigation')),
                PopupMenuItem(value: 'resolved', child: Text('Mark Resolved')),
                PopupMenuItem(value: 'closed', child: Text('Close Case')),
              ],
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.policePrimary))
          : _report == null
              ? const Center(child: Text('Report not found'))
              : Column(
                  children: [
                    _buildReportHeader(),
                    _buildTabBar(),
                    Expanded(child: _buildTabContent(user)),
                  ],
                ),
    );
  }

  Widget _buildReportHeader() {
    final r = _report!;
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(r.title,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: r.statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(r.statusLabel,
                    style: TextStyle(color: r.statusColor, fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(r.description, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _chip(Icons.category_outlined, r.type),
              _chip(Icons.flag_outlined, '${r.priority} priority', color: r.priorityColor),
              if (r.location != null) _chip(Icons.location_on_outlined, r.location!),
              if (r.createdAt != null)
                _chip(Icons.calendar_today_outlined, DateFormat('MMM d, y').format(r.createdAt!)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _chip(IconData icon, String label, {Color? color}) {
    final c = color ?? AppTheme.textSecondary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: c.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: c),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, color: c, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      child: Row(
        children: [
          _tabItem(0, 'Timeline'),
          _tabItem(1, 'Messages'),
          _tabItem(2, 'Actions'),
        ],
      ),
    );
  }

  Widget _tabItem(int index, String label) {
    final sel = _tab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(
              color: sel ? AppTheme.policePrimary : Colors.transparent, width: 2)),
          ),
          child: Text(label,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: sel ? AppTheme.policePrimary : AppTheme.textSecondary,
                fontWeight: sel ? FontWeight.w600 : FontWeight.w400,
                fontSize: 13,
              )),
        ),
      ),
    );
  }

  Widget _buildTabContent(user) {
    switch (_tab) {
      case 0: return _buildTimeline();
      case 1: return _buildMessages(user);
      case 2: return _buildActions(user);
      default: return const SizedBox();
    }
  }

  Widget _buildTimeline() {
    if (_timeline.isEmpty) {
      return const Center(child: Text('No timeline entries', style: TextStyle(color: AppTheme.textSecondary)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _timeline.length,
      itemBuilder: (context, i) {
        final t = _timeline[i];
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 12, height: 12,
                  decoration: const BoxDecoration(
                    color: AppTheme.policePrimary, shape: BoxShape.circle),
                ),
                if (i < _timeline.length - 1)
                  Container(width: 2, height: 48, color: const Color(0xFFE2E8F0)),
              ],
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(t['action'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    Text('By ${t['actorName']} · ${t['actorRole']}',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    if (t['notes'] != null && t['notes'].toString().isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(t['notes'].toString(),
                            style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                      ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildMessages(user) {
    return Column(
      children: [
        Expanded(
          child: _messages.isEmpty
              ? const Center(child: Text('No messages yet', style: TextStyle(color: AppTheme.textSecondary)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, i) {
                    final m = _messages[i];
                    final isMe = m['senderId'] == user.id;
                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.7),
                        decoration: BoxDecoration(
                          color: isMe ? AppTheme.policePrimary : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: isMe ? null : Border.all(color: AppTheme.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!isMe)
                              Text('${m['senderName']}',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600,
                                      color: AppTheme.textSecondary)),
                            Text('${m['content']}',
                                style: TextStyle(color: isMe ? Colors.white : AppTheme.textPrimary, fontSize: 14)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppTheme.border)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _msgCtrl,
                  decoration: InputDecoration(
                    hintText: 'Send a message...',
                    filled: true,
                    fillColor: AppTheme.background,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _sendingMsg ? null : _sendMessage,
                child: Container(
                  padding: const EdgeInsets.all(11),
                  decoration: const BoxDecoration(
                      color: AppTheme.policePrimary, shape: BoxShape.circle),
                  child: _sendingMsg
                      ? const SizedBox(width: 18, height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActions(user) {
    final statuses = [
      ('assigned', 'Mark as Assigned', Icons.assignment_ind_outlined, AppTheme.warning),
      ('under_investigation', 'Under Investigation', Icons.search, const Color(0xFF7C3AED)),
      ('resolved', 'Mark as Resolved', Icons.check_circle_outline, AppTheme.success),
      ('closed', 'Close Case', Icons.archive_outlined, AppTheme.textSecondary),
    ];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Update Case Status',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
        const SizedBox(height: 12),
        ...statuses.map((s) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: s.$4,
              minimumSize: const Size(double.infinity, 48),
            ),
            icon: _updatingStatus == s.$1
                ? const SizedBox(width: 18, height: 18,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Icon(s.$3, size: 18),
            label: Text(s.$2),
            onPressed: _updatingStatus.isNotEmpty ? null : () => _updateStatus(s.$1),
          ),
        )),
      ],
    );
  }
}
