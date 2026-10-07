import React from 'react';
import { act, create } from 'react-test-renderer';
import Constants from 'expo-constants';
import AboutScreen from 'app/screens/AboutScreen';
import buildIdentity from 'app/config/generatedBuildIdentity.json';
jest.mock('native-base', () => ({ Center: require('react-native').View }));
jest.mock('expo-constants', () => ({
  nativeAppVersion: '9.4.synthetic',
  nativeBuildVersion: '321',
}));
jest.mock('app/config/generatedBuildIdentity.json', () => ({
  versionName: 'stale.bundle.version',
  versionCode: '999',
  buildDate: '2026-10-05',
  sourceCommit: '0123456789abcdef',
  sourceDirty: false,
}));
test('About displays installed native version/code instead of a stale JS release label', () => {
  const tree = create(<AboutScreen />);
  const text = tree.root
    .findByProps({ testID: 'about_installed_build_identity' })
    .props.children.join('');
  expect(text).toContain('Version: 9.4.synthetic');
  expect(text).toContain('Build: 321');
  expect(text).not.toContain('stale.bundle.version');
  expect(text).not.toContain('999');
  expect(text).toContain('Source: 0123456789ab');
  Constants.nativeAppVersion = '10.0.synthetic';
  Constants.nativeBuildVersion = '322';
  act(() => tree.update(<AboutScreen />));
  const updated = tree.root
    .findByProps({ testID: 'about_installed_build_identity' })
    .props.children.join('');
  expect(updated).toContain('Version: 10.0.synthetic');
  expect(updated).toContain('Build: 322');
  act(() => tree.unmount());
});

test('About explicitly describes dirty source as uncommitted changes based on its base commit', () => {
  buildIdentity.sourceDirty = true;
  const tree = create(<AboutScreen />);
  const text = tree.root
    .findByProps({ testID: 'about_installed_build_identity' })
    .props.children.join('');
  expect(text).toContain('Source: Uncommitted changes based on 0123456789ab');
  act(() => tree.unmount());
  buildIdentity.sourceDirty = false;
});
