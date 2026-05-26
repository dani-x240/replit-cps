import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../models/report.dart';
import '../models/alert.dart';

// Change this to your Replit app URL or http://localhost:5000 for local dev
const String kBaseUrl = 'https://24351c08-27b9-46b5-a272-2e8b4552e38e-00-2eyvipc4fz7c5.worf.replit.dev';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);
  @override
  String toString() => message;
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Session cookie from login
  String? _cookie;
  String get cookie => _cookie ?? '';

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_cookie != null) 'Cookie': _cookie!,
      };

  void _saveCookie(http.Response response) {
    final setCookie = response.headers['set-cookie'];
    if (setCookie != null) _cookie = setCookie.split(';').first;
  }

  Future<Map<String, dynamic>> _parseResponse(http.Response response) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    }
    String msg = 'Request failed';
    try {
      final body = json.decode(response.body);
      msg = body['message'] ?? msg;
    } catch (_) {}
    throw ApiException(msg, response.statusCode);
  }

  // AUTH
  Future<User> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/auth/login'),
      headers: _headers,
      body: json.encode({'username': username, 'password': password}),
    );
    _saveCookie(response);
    final data = await _parseResponse(response);
    return User.fromJson(data);
  }

  Future<User> register(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/auth/register'),
      headers: _headers,
      body: json.encode(data),
    );
    _saveCookie(response);
    final body = await _parseResponse(response);
    return User.fromJson(body);
  }

  Future<User?> getMe() async {
    if (_cookie == null) return null;
    final response = await http.get(
      Uri.parse('$kBaseUrl/api/user'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data == null) return null;
      return User.fromJson(data);
    }
    return null;
  }

  Future<void> logout() async {
    await http.post(
      Uri.parse('$kBaseUrl/api/auth/logout'),
      headers: _headers,
    );
    _cookie = null;
  }

  // REPORTS
  Future<List<Report>> getReports() async {
    final response = await http.get(
      Uri.parse('$kBaseUrl/api/reports'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((e) => Report.fromJson(e)).toList();
    }
    return [];
  }

  Future<Report> createReport(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/reports'),
      headers: _headers,
      body: json.encode(data),
    );
    final body = await _parseResponse(response);
    return Report.fromJson(body);
  }

  Future<Report> updateReport(int id, Map<String, dynamic> data) async {
    final response = await http.patch(
      Uri.parse('$kBaseUrl/api/reports/$id'),
      headers: _headers,
      body: json.encode(data),
    );
    final body = await _parseResponse(response);
    return Report.fromJson(body);
  }

  Future<List<Map<String, dynamic>>> getTimeline(int reportId) async {
    final response = await http.get(
      Uri.parse('$kBaseUrl/api/reports/$reportId/timeline'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getMessages(int reportId) async {
    final response = await http.get(
      Uri.parse('$kBaseUrl/api/reports/$reportId/messages'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> sendMessage(int reportId, String content) async {
    await http.post(
      Uri.parse('$kBaseUrl/api/reports/$reportId/messages'),
      headers: _headers,
      body: json.encode({'content': content}),
    );
  }

  // ALERTS
  Future<List<AppAlert>> getAlerts() async {
    final response = await http.get(
      Uri.parse('$kBaseUrl/api/alerts'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((e) => AppAlert.fromJson(e)).toList();
    }
    return [];
  }

  // SOS
  Future<Map<String, dynamic>> triggerSos(Map<String, dynamic>? coords) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/sos'),
      headers: _headers,
      body: json.encode({'coords': coords}),
    );
    return json.decode(response.body);
  }

  // AI CHAT
  Future<String> sendChatMessage(int conversationId, String message) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/chat/$conversationId/messages'),
      headers: _headers,
      body: json.encode({'role': 'user', 'content': message}),
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['content'] ?? '';
    }
    throw ApiException('Chat failed');
  }

  Future<Map<String, dynamic>> createConversation(String title) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/chat/conversations'),
      headers: _headers,
      body: json.encode({'title': title}),
    );
    return json.decode(response.body);
  }

  Future<List<Map<String, dynamic>>> getChatMessages(int conversationId) async {
    final response = await http.get(
      Uri.parse('$kBaseUrl/api/chat/$conversationId/messages'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.cast<Map<String, dynamic>>();
    }
    return [];
  }
}
