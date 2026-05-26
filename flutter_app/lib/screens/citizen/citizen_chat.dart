import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';

class CitizenChatScreen extends StatefulWidget {
  const CitizenChatScreen({super.key});
  @override
  State<CitizenChatScreen> createState() => _CitizenChatScreenState();
}

class _CitizenChatScreenState extends State<CitizenChatScreen> {
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  final List<_ChatMsg> _messages = [];
  bool _loading = false;
  int? _conversationId;

  @override
  void initState() {
    super.initState();
    _initConversation();
  }

  Future<void> _initConversation() async {
    try {
      final conv = await ApiService().createConversation('Crime Report Chat');
      _conversationId = conv['id'];
      // Load existing messages
      final msgs = await ApiService().getChatMessages(_conversationId!);
      if (mounted) {
        setState(() {
          _messages.addAll(msgs.map((m) => _ChatMsg(
            content: m['content'],
            isUser: m['role'] == 'user',
          )));
        });
      }
    } catch (_) {
      // Start fresh if conversation fails
    }
    if (_messages.isEmpty) {
      setState(() => _messages.add(const _ChatMsg(
        content: "Hello! I'm the CPS AI Crime Assistant. I'm here to help you report crimes, provide safety guidance, and connect you with the right authorities. How can I help you today?",
        isUser: false,
      )));
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty || _loading) return;
    _ctrl.clear();
    setState(() {
      _messages.add(_ChatMsg(content: text, isUser: true));
      _loading = true;
    });
    _scrollDown();

    try {
      String reply;
      if (_conversationId != null) {
        reply = await ApiService().sendChatMessage(_conversationId!, text);
      } else {
        reply = "I'm sorry, I couldn't connect to the AI service right now. Please try again later.";
      }
      if (mounted) {
        setState(() {
          _messages.add(_ChatMsg(content: reply, isUser: false));
          _loading = false;
        });
        _scrollDown();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(_ChatMsg(content: 'Sorry, I encountered an error. Please try again.', isUser: false));
          _loading = false;
        });
      }
    }
  }

  void _scrollDown() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.citizenPrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: Colors.white24,
              child: Icon(Icons.smart_toy_outlined, color: Colors.white, size: 18),
            ),
            SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Crime Assistant', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                Text('Always available', style: TextStyle(color: Colors.white70, fontSize: 11)),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scroll,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_loading ? 1 : 0),
              itemBuilder: (context, i) {
                if (i == _messages.length) return _buildTyping();
                return _buildMessage(_messages[i]);
              },
            ),
          ),
          _buildInput(),
        ],
      ),
    );
  }

  Widget _buildMessage(_ChatMsg msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: msg.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!msg.isUser) ...[
            const CircleAvatar(
              radius: 14,
              backgroundColor: AppTheme.citizenLight,
              child: Icon(Icons.smart_toy_outlined, size: 16, color: AppTheme.citizenPrimary),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: msg.isUser ? AppTheme.citizenPrimary : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(msg.isUser ? 16 : 4),
                  bottomRight: Radius.circular(msg.isUser ? 4 : 16),
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 1)),
                ],
              ),
              child: Text(
                msg.content,
                style: TextStyle(color: msg.isUser ? Colors.white : AppTheme.textPrimary, fontSize: 14, height: 1.4),
              ),
            ),
          ),
          if (msg.isUser) const SizedBox(width: 8),
        ],
      ),
    );
  }

  Widget _buildTyping() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 14,
            backgroundColor: AppTheme.citizenLight,
            child: Icon(Icons.smart_toy_outlined, size: 16, color: AppTheme.citizenPrimary),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const SizedBox(
              width: 40,
              height: 16,
              child: Center(child: LinearProgressIndicator(color: AppTheme.citizenPrimary)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppTheme.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _ctrl,
              maxLines: null,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _send(),
              decoration: InputDecoration(
                hintText: 'Describe what happened...',
                hintStyle: const TextStyle(color: AppTheme.textSecondary),
                filled: true,
                fillColor: AppTheme.background,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _send,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: AppTheme.citizenPrimary,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMsg {
  final String content;
  final bool isUser;
  const _ChatMsg({required this.content, required this.isUser});
}
