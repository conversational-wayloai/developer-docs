'use client';

import { useStaticSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog as FumaSearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';

import { basePath } from '~/config/env';

export default function SearchDialog(props: SharedProps) {
  const search = useStaticSearch({
    from: `${basePath}/api/search`,
  });

  return (
    <FumaSearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </FumaSearchDialog>
  );
}
