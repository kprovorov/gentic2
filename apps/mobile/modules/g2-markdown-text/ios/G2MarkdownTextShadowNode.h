#pragma once

#include <react/renderer/components/G2MarkdownTextSpec/EventEmitters.h>
#include <react/renderer/components/G2MarkdownTextSpec/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>
#include <react/renderer/core/LayoutContext.h>
#include <react/renderer/core/ShadowNode.h>

#include <string>
#include <vector>

namespace facebook::react {

extern const char G2MarkdownTextComponentName[];

struct G2MarkdownTextParagraphStyleRange {
  size_t location;
  size_t length;
  Float firstLineHeadIndent;
  Float headIndent;
  Float paragraphSpacing;
};

struct G2MarkdownTextAttachmentRange {
  size_t location;
  size_t length;
  std::string imageUri;
  /// Recolor the loaded image with the run's foreground color, like `sf:` symbols.
  bool tintWithForeground;
  Float chipWidth = 0;
  Float chipHeight = 0;
};

inline Float G2MarkdownTextAttachmentSize(const G2MarkdownTextAttachmentRange &) {
  return 14;
}

inline Float G2MarkdownTextAttachmentBaselineOffset(
    const G2MarkdownTextAttachmentRange &) {
  return -2;
}

class G2MarkdownTextStateReal final {
 public:
  AttributedString attributedString;
  std::vector<G2MarkdownTextParagraphStyleRange> paragraphStyleRanges;
  std::vector<G2MarkdownTextAttachmentRange> attachmentRanges;
};

class G2MarkdownTextShadowNode final : public ConcreteViewShadowNode<
G2MarkdownTextComponentName,
G2MarkdownTextProps,
G2MarkdownTextEventEmitter,
G2MarkdownTextStateReal> {
public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  G2MarkdownTextShadowNode(
   const ShadowNode& sourceShadowNode,
   const ShadowNodeFragment& fragment
  );

  static ShadowNodeTraits BaseTraits() {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
    traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
    return traits;
  }

  void layout(LayoutContext layoutContext) override;

  Size measureContent(
      const LayoutContext& layoutContext,
      const LayoutConstraints& layoutConstraints) const override;

private:
  mutable AttributedString _attributedString;
  mutable std::vector<G2MarkdownTextParagraphStyleRange> _paragraphStyleRanges;
  mutable std::vector<G2MarkdownTextAttachmentRange> _attachmentRanges;
};
} // namespace facebook::React
