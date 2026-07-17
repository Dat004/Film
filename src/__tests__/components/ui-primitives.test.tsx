import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

describe('Dialog primitive', () => {
  it('renders title and description when open', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test Modal</DialogTitle>
          <DialogDescription>Modal body</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });
});

describe('Switch primitive', () => {
  it('renders and toggles checked state', async () => {
    const user = userEvent.setup();
    let checked = false;
    const onChange = (v: boolean) => {
      checked = v;
    };

    const { rerender } = render(
      <Switch checked={checked} onCheckedChange={onChange} aria-label="Toggle" />
    );

    await user.click(screen.getByRole('switch'));
    rerender(<Switch checked={checked} onCheckedChange={onChange} aria-label="Toggle" />);
    expect(checked).toBe(true);
  });
});

describe('Tabs primitive', () => {
  it('renders triggers and shows active content', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Content A')).toBeInTheDocument();
  });
});
