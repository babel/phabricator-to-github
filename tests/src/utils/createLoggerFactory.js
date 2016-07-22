import test from 'ava';
import createLoggerFactory from '../../../src/utils/createLoggerFactory';

test('correctly sets level', t => {
  const log = createLoggerFactory('debug')('foo');

  t.is(log.transports.console.level, 'debug');
});

test('correctly sets label', t => {
  const log = createLoggerFactory('debug')('foo');

  t.is(log.transports.console.label, 'foo');
});
