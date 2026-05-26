class User {
  final int id;
  final String username;
  final String fullName;
  final String? email;
  final String? phone;
  final String role;
  final String? nin;
  final bool isVerified;
  final String? district;
  final String? parish;
  final String? stationId;

  const User({
    required this.id,
    required this.username,
    required this.fullName,
    this.email,
    this.phone,
    required this.role,
    this.nin,
    this.isVerified = false,
    this.district,
    this.parish,
    this.stationId,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'],
        username: json['username'],
        fullName: json['fullName'] ?? json['full_name'] ?? '',
        email: json['email'],
        phone: json['phone'],
        role: json['role'],
        nin: json['nin'],
        isVerified: json['isVerified'] ?? json['is_verified'] ?? false,
        district: json['district'],
        parish: json['parish'],
        stationId: json['stationId'] ?? json['station_id'],
      );

  bool get isCitizen => role == 'citizen';
  bool get isPolice => ['police_io', 'police_oc', 'police_dpc'].contains(role);
  bool get isAdmin => role == 'admin';

  String get roleLabel {
    switch (role) {
      case 'citizen': return 'Citizen';
      case 'police_io': return 'Investigating Officer';
      case 'police_oc': return 'Officer in Charge';
      case 'police_dpc': return 'District Police Commander';
      case 'admin': return 'Administrator';
      default: return role;
    }
  }
}
