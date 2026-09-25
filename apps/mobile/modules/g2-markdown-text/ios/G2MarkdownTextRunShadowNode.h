#pragma once

#include <react/renderer/components/G2MarkdownTextSpec/EventEmitters.h>
#include <react/renderer/components/G2MarkdownTextSpec/Props.h>
#include <react/renderer/components/G2MarkdownTextSpec/States.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace facebook::react {
extern const char G2MarkdownTextRunComponentName[];

using G2MarkdownTextRunShadowNode = ConcreteViewShadowNode<
    G2MarkdownTextRunComponentName,
    G2MarkdownTextRunProps,
    G2MarkdownTextRunEventEmitter,
    G2MarkdownTextRunState>;
}
