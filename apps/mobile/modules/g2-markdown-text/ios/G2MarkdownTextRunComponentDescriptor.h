#pragma once

#include "G2MarkdownTextRunShadowNode.h"

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>

namespace facebook::react {
using G2MarkdownTextRunComponentDescriptor = ConcreteComponentDescriptor<G2MarkdownTextRunShadowNode>;

void G2MarkdownTextRunSpec_registerComponentDescriptorsFromCodegen(
  std::shared_ptr<const ComponentDescriptorProviderRegistry> registry);
}
