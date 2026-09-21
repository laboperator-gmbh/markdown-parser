import { defaultSchema } from 'hast-util-sanitize';
import merge from 'lodash/merge.js';
import type { Handler } from 'mdast-util-to-hast';
import raw from 'rehype-raw';
import sanitize from 'rehype-sanitize';
import gfm from 'remark-gfm';
import md2mdast from 'remark-parse';
import mdast2hast from 'remark-rehype';
import type { PluggableList } from 'unified';
import type { Element, ElementContent, Properties } from 'hast';
import type { Parents } from 'mdast';

import extensions from './extensions.js';

// `Handler` types its node as `any`; our extensions attach `props` to it.
type ExtensionNode = Parents & { props: Properties };

const element = (
  tagName: string,
  properties: Properties,
  children: ElementContent[] = [],
): Element => ({
  children,
  properties,
  tagName,
  type: 'element',
});

const handlers: Record<string, Handler> = {
  grid: (state, node: ExtensionNode) =>
    element('grid', node.props, state.all(node)),
  gridcontainer: (state, node: ExtensionNode) =>
    element('gridcontainer', node.props, state.all(node)),

  banginterpolation: (_state, node: ExtensionNode) =>
    element('banginterpolation', node.props),
  interpolation: (_state, node: ExtensionNode) =>
    element('interpolation', node.props),
};

const flavouredSchema = merge({}, defaultSchema, {
  attributes: {
    grid: [
      'container',
      'card',
      'alignItems',
      'justifyContent',
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
    ],

    banginterpolation: ['formula'],
    interpolation: ['formula'],
  },
});

flavouredSchema.tagNames = [
  ...(flavouredSchema.tagNames || []),
  'gridcontainer',
  'grid',
  'banginterpolation',
  'interpolation',
];

const md2hast: PluggableList = [
  md2mdast,
  gfm,
  extensions,
  [mdast2hast, { allowDangerousHtml: true, handlers }], // @option: allow raw html inside markdown
  raw, // parse raw html into hast
  [sanitize, flavouredSchema],
];

export default md2hast;
