import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';

class CitizenSosScreen extends StatefulWidget {
  const CitizenSosScreen({super.key});
  @override
  State<CitizenSosScreen> createState() => _CitizenSosScreenState();
}

class _CitizenSosScreenState extends State<CitizenSosScreen> with TickerProviderStateMixin {
  // States: idle, pressing, triggered, choosing
  String _state = 'idle';
  Timer? _pressTimer;
  Timer? _choiceTimer;
  Timer? _pulseTimer;
  double _pressProgress = 0;
  int _choiceSecondsLeft = 6;
  int? _sosAlertId;

  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pressTimer?.cancel();
    _choiceTimer?.cancel();
    _pulseTimer?.cancel();
    _pulseCtrl.dispose();
    super.dispose();
  }

  void _onPressStart() {
    if (_state != 'idle') return;
    setState(() { _state = 'pressing'; _pressProgress = 0; });
    const interval = Duration(milliseconds: 30);
    int elapsed = 0;
    _pressTimer = Timer.periodic(interval, (t) {
      elapsed += 30;
      setState(() => _pressProgress = elapsed / 3000);
      if (elapsed >= 3000) {
        t.cancel();
        _triggerSos();
      }
    });
  }

  void _onPressEnd() {
    if (_state == 'pressing') {
      _pressTimer?.cancel();
      setState(() { _state = 'idle'; _pressProgress = 0; });
    }
  }

  Future<void> _triggerSos() async {
    setState(() { _state = 'triggered'; _choiceSecondsLeft = 6; });
    try {
      final result = await ApiService().triggerSos(null);
      _sosAlertId = result['id'];
    } catch (_) {}

    _choiceTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => _choiceSecondsLeft--);
      if (_choiceSecondsLeft <= 0) {
        t.cancel();
        setState(() => _state = 'choosing');
      }
    });
  }

  void _callEmergency() {
    _choiceTimer?.cancel();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Calling 999 Emergency Services...')),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _state = 'idle');
    });
  }

  void _reset() {
    _choiceTimer?.cancel();
    _pressTimer?.cancel();
    setState(() { _state = 'idle'; _pressProgress = 0; _choiceSecondsLeft = 6; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        title: const Text('SOS Emergency', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: _state == 'idle' || _state == 'pressing'
            ? _buildHoldButton()
            : _state == 'triggered'
                ? _buildTriggered()
                : _buildChoosing(),
      ),
    );
  }

  Widget _buildHoldButton() {
    return Column(
      children: [
        const Spacer(),
        const Text('EMERGENCY SOS',
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: 2)),
        const SizedBox(height: 8),
        const Text('Hold the button for 3 seconds to activate',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
        const SizedBox(height: 60),
        GestureDetector(
          onLongPressStart: (_) => _onPressStart(),
          onLongPressEnd: (_) => _onPressEnd(),
          onTapDown: (_) => _onPressStart(),
          onTapUp: (_) => _onPressEnd(),
          onTapCancel: _onPressEnd,
          child: AnimatedBuilder(
            animation: _pulseAnim,
            builder: (context, child) {
              final scale = _state == 'idle' ? _pulseAnim.value : 1.0;
              return Transform.scale(
                scale: scale,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer ring
                    Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.danger.withOpacity(0.3), width: 2),
                      ),
                    ),
                    // Progress ring
                    if (_state == 'pressing')
                      SizedBox(
                        width: 190,
                        height: 190,
                        child: CircularProgressIndicator(
                          value: _pressProgress,
                          strokeWidth: 6,
                          backgroundColor: Colors.transparent,
                          valueColor: const AlwaysStoppedAnimation(AppTheme.danger),
                        ),
                      ),
                    // Button
                    Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _state == 'pressing' ? const Color(0xFFB91C1C) : AppTheme.danger,
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.danger.withOpacity(0.5),
                            blurRadius: 30,
                            spreadRadius: 5,
                          ),
                        ],
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.sos_rounded, color: Colors.white, size: 48),
                          SizedBox(height: 4),
                          Text('HOLD', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.all(24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _infoChip(Icons.location_on_outlined, 'GPS Active'),
              _infoChip(Icons.mic_none_outlined, 'Audio Ready'),
              _infoChip(Icons.videocam_outlined, 'Video Ready'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTriggered() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.warning_amber_rounded, color: AppTheme.warning, size: 64),
        const SizedBox(height: 16),
        const Text('SOS ACTIVATED', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('Authorities have been alerted', style: TextStyle(color: Color(0xFF94A3B8))),
        const SizedBox(height: 32),
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppTheme.warning, width: 3),
          ),
          child: Center(
            child: Text('$_choiceSecondsLeft',
                style: const TextStyle(color: AppTheme.warning, fontSize: 42, fontWeight: FontWeight.w800)),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Choose an option below', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _choiceButton(Icons.call, 'Call 999', AppTheme.danger, _callEmergency),
            const SizedBox(width: 16),
            _choiceButton(Icons.cancel_outlined, 'Cancel', const Color(0xFF475569), _reset),
          ],
        ),
      ],
    );
  }

  Widget _buildChoosing() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.mic, color: AppTheme.danger, size: 64),
        const SizedBox(height: 16),
        const Text('RECORDING AUDIO', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        const Text('30-second auto recording in progress', style: TextStyle(color: Color(0xFF94A3B8))),
        const SizedBox(height: 32),
        SizedBox(
          width: 200,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF475569)),
            onPressed: _reset,
            child: const Text('Stop & Reset'),
          ),
        ),
      ],
    );
  }

  Widget _choiceButton(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 130,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white, size: 28),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: const Color(0xFF94A3B8), size: 14),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
        ],
      ),
    );
  }
}
