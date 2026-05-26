import 'package:flutter/material.dart';

class Report {
  final int id;
  final String? caseNumber;
  final String title;
  final String description;
  final String type;
  final String status;
  final String? location;
  final String priority;
  final int createdById;
  final int? assignedToId;
  final String? stationId;
  final String? officerNotes;
  final DateTime? createdAt;

  const Report({
    required this.id,
    this.caseNumber,
    required this.title,
    required this.description,
    required this.type,
    required this.status,
    this.location,
    required this.priority,
    required this.createdById,
    this.assignedToId,
    this.stationId,
    this.officerNotes,
    this.createdAt,
  });

  factory Report.fromJson(Map<String, dynamic> json) => Report(
        id: json['id'],
        caseNumber: json['caseNumber'] ?? json['case_number'],
        title: json['title'],
        description: json['description'],
        type: json['type'],
        status: json['status'] ?? 'submitted',
        location: json['location'],
        priority: json['priority'] ?? 'medium',
        createdById: json['createdById'] ?? json['created_by_id'] ?? 0,
        assignedToId: json['assignedToId'] ?? json['assigned_to_id'],
        stationId: json['stationId'] ?? json['station_id'],
        officerNotes: json['officerNotes'] ?? json['officer_notes'],
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'])
            : json['created_at'] != null
                ? DateTime.tryParse(json['created_at'])
                : null,
      );

  Color get statusColor {
    switch (status) {
      case 'submitted': return const Color(0xFF2563EB);
      case 'assigned': return const Color(0xFFD97706);
      case 'under_investigation': return const Color(0xFF7C3AED);
      case 'resolved': return const Color(0xFF16A34A);
      case 'closed': return const Color(0xFF64748B);
      default: return const Color(0xFF64748B);
    }
  }

  String get statusLabel {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'assigned': return 'Assigned';
      case 'under_investigation': return 'Under Investigation';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  }

  Color get priorityColor {
    switch (priority) {
      case 'high': return const Color(0xFFDC2626);
      case 'medium': return const Color(0xFFD97706);
      case 'low': return const Color(0xFF16A34A);
      default: return const Color(0xFF64748B);
    }
  }
}
