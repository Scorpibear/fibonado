import { TimeSpanPipe } from './time-span.pipe';

describe('TimeSpanPipe', () => {
  const pipe = new TimeSpanPipe();

  it('works for just seconds', () => {
    expect(pipe.transform(1000)).toEqual("0:01");
  })
  it('works for one digit minute', () => {
    expect(pipe.transform(5 * 60 * 1000)).toEqual("5:00");
  })
  it('works for one digit minute with hours', () => {
    expect(pipe.transform(65 * 60 * 1000)).toEqual("1:05:00");
  })
  it('works for days', () => {
    expect(pipe.transform(25 * 60 * 60 * 1000)).toEqual("1d1:00:00");
  })
});
