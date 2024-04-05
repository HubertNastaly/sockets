type SampleType = string

export class Benchmark {
  private _start: Map<SampleType, bigint | undefined>
  private samples: Map<SampleType, bigint[]>

  constructor(sampleTypes: SampleType[]) {
    this.samples = new Map<SampleType, bigint[]>()
    this._start = new Map<SampleType, bigint | undefined>()

    sampleTypes.forEach(sampleType => {
      this.samples.set(sampleType, [])
    })
  }

  start(sampleType: SampleType) {
    if(this._start.get(sampleType)) return;
    this._start.set(sampleType, process.hrtime.bigint()) 
  }

  stop(sampleType: SampleType) {
    const _start = this._start.get(sampleType)
    if(!_start) return;

    const samples = this.samples.get(sampleType)
    if(!samples) {
      throw new Error('No samples stored')
    }
    samples.push(process.hrtime.bigint() - _start)
    this._start.set(sampleType, undefined)
  }

  getAverage(sampleType: SampleType): bigint {
    const samples = this.samples.get(sampleType)
    if(!samples || !samples.length) return BigInt(0)
  
    const sum = samples.reduce((acc, sample) => acc += sample, BigInt(0))
    return sum / BigInt(samples.length)
  }
}
