import 'package:flutter/material.dart';

class AutoFitScreen extends StatelessWidget {
  final Widget child;
  final Size designSize;

  const AutoFitScreen({
    super.key,
    required this.child,
    this.designSize = const Size(390, 844),
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final scaleX = constraints.maxWidth / designSize.width;
        final scaleY = constraints.maxHeight / designSize.height;
        final scale = scaleX < scaleY ? scaleX : scaleY;
        return Center(
          child: SizedBox(
            width: designSize.width * scale,
            height: designSize.height * scale,
            child: Transform.scale(
              scale: scale,
              alignment: Alignment.topCenter,
              child: SizedBox(
                width: designSize.width,
                height: designSize.height,
                child: child,
              ),
            ),
          ),
        );
      },
    );
  }
}
