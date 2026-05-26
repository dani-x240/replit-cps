import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tab;
  final _loginForm = GlobalKey<FormState>();
  final _registerForm = GlobalKey<FormState>();

  // Login fields
  final _userCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  // Register fields
  final _rUserCtrl = TextEditingController();
  final _rPassCtrl = TextEditingController();
  final _rNameCtrl = TextEditingController();
  final _rPhoneCtrl = TextEditingController();
  String _selectedRole = 'citizen';
  bool _obscurePass = true;
  bool _obscureRPass = true;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    _userCtrl.dispose();
    _passCtrl.dispose();
    _rUserCtrl.dispose();
    _rPassCtrl.dispose();
    _rNameCtrl.dispose();
    _rPhoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_loginForm.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.login(_userCtrl.text.trim(), _passCtrl.text);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Login failed'), backgroundColor: AppTheme.danger),
      );
    }
  }

  Future<void> _register() async {
    if (!_registerForm.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.register({
      'username': _rUserCtrl.text.trim(),
      'password': _rPassCtrl.text,
      'fullName': _rNameCtrl.text.trim(),
      'phone': _rPhoneCtrl.text.trim(),
      'role': _selectedRole,
    });
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Registration failed'), backgroundColor: AppTheme.danger),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF15803D), Color(0xFF166534)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 40),
              // Logo
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.shield, size: 48, color: Colors.white),
              ),
              const SizedBox(height: 16),
              const Text('CPS Mobile',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white)),
              const Text('Crime Prevention System',
                  style: TextStyle(fontSize: 14, color: Colors.white70)),
              const SizedBox(height: 32),
              // Card
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 8),
                      Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      TabBar(
                        controller: _tab,
                        labelColor: AppTheme.citizenPrimary,
                        unselectedLabelColor: AppTheme.textSecondary,
                        indicatorColor: AppTheme.citizenPrimary,
                        tabs: const [Tab(text: 'Sign In'), Tab(text: 'Register')],
                      ),
                      Expanded(
                        child: TabBarView(
                          controller: _tab,
                          children: [
                            _buildLoginTab(auth),
                            _buildRegisterTab(auth),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoginTab(AuthProvider auth) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _loginForm,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Welcome back', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            const Text('Sign in to your account', style: TextStyle(color: AppTheme.textSecondary)),
            const SizedBox(height: 24),
            TextFormField(
              controller: _userCtrl,
              decoration: const InputDecoration(
                labelText: 'Username',
                prefixIcon: Icon(Icons.person_outline),
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _passCtrl,
              obscureText: _obscurePass,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(_obscurePass ? Icons.visibility_off : Icons.visibility),
                  onPressed: () => setState(() => _obscurePass = !_obscurePass),
                ),
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: auth.loading ? null : _login,
              child: auth.loading
                  ? const SizedBox(height: 20, width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Sign In'),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Demo Accounts', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.citizenPrimary)),
                  const SizedBox(height: 6),
                  _demoAccount('Citizen', 'ogwang_daiel', 'btynatqnavry'),
                  _demoAccount('IO', 'otim_joshua', 'iam josh'),
                  _demoAccount('OC', 'jowie', '123456789'),
                  _demoAccount('DPC', 'dpc_demo', 'password123'),
                  _demoAccount('Admin', 'admin', 'password123'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _demoAccount(String label, String user, String pass) {
    return GestureDetector(
      onTap: () {
        _userCtrl.text = user;
        _passCtrl.text = pass;
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Text(
          '$label: $user / $pass',
          style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
        ),
      ),
    );
  }

  Widget _buildRegisterTab(AuthProvider auth) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _registerForm,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Create Account', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            const Text('Join CPS Mobile today', style: TextStyle(color: AppTheme.textSecondary)),
            const SizedBox(height: 24),
            TextFormField(
              controller: _rNameCtrl,
              decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.badge_outlined)),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _rUserCtrl,
              decoration: const InputDecoration(labelText: 'Username', prefixIcon: Icon(Icons.person_outline)),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _rPhoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone Number', prefixIcon: Icon(Icons.phone_outlined)),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedRole,
              decoration: const InputDecoration(labelText: 'I am a...', prefixIcon: Icon(Icons.group_outlined)),
              items: const [
                DropdownMenuItem(value: 'citizen', child: Text('Citizen')),
                DropdownMenuItem(value: 'police_io', child: Text('Police - Investigating Officer')),
                DropdownMenuItem(value: 'police_oc', child: Text('Police - Officer in Charge')),
                DropdownMenuItem(value: 'police_dpc', child: Text('Police - DPC')),
              ],
              onChanged: (v) => setState(() => _selectedRole = v!),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _rPassCtrl,
              obscureText: _obscureRPass,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(_obscureRPass ? Icons.visibility_off : Icons.visibility),
                  onPressed: () => setState(() => _obscureRPass = !_obscureRPass),
                ),
              ),
              validator: (v) => v!.length < 4 ? 'Min 4 characters' : null,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: auth.loading ? null : _register,
              child: auth.loading
                  ? const SizedBox(height: 20, width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Create Account'),
            ),
          ],
        ),
      ),
    );
  }
}
