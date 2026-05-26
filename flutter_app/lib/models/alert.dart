class AppAlert {
  final int id;
  final String title;
  final String content;
  final String type;
  final String? location;
  final String severity;
  final int createdById;
  final DateTime? createdAt;

  const AppAlert({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    this.location,
    required this.severity,
    required this.createdById,
    this.createdAt,
  });

  factory AppAlert.fromJson(Map<String, dynamic> json) => AppAlert(
        id: json['id'],
        title: json['title'],
        content: json['content'],
        type: json['type'],
        location: json['location'],
        severity: json['severity'] ?? 'info',
        createdById: json['createdById'] ?? json['created_by_id'] ?? 0,
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'])
            : json['created_at'] != null
                ? DateTime.tryParse(json['created_at'])
                : null,
      );
}
