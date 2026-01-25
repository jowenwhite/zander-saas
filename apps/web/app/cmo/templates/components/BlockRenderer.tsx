'use client';
import { EmailBlock } from '../types';
import {
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  ColumnsBlock,
  SocialBlock,
  FooterBlock,
} from './blocks';

interface BlockRendererProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function BlockRenderer({ block, isSelected, onSelect }: BlockRendererProps) {
  switch (block.type) {
    case 'header':
      return <HeaderBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    case 'text':
      return <TextBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    case 'image':
      return <ImageBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    case 'button':
      return <ButtonBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    case 'divider':
      return <DividerBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    case 'columns':
      return <ColumnsBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    case 'social':
      return <SocialBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    case 'footer':
      return <FooterBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
    default:
      return (
        <div style={{ padding: '1rem', background: '#fee', color: '#c00' }}>
          Unknown block type: {block.type}
        </div>
      );
  }
}
