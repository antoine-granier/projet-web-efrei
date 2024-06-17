// import { InjectQueue } from '@nestjs/bull';
// import { Controller, Get } from '@nestjs/common';
// import { Queue } from 'bull';

// @Controller('health')
// export class HealthController {

//   constructor(@InjectQueue('my-queue') private readonly myQueue: Queue) {}

//   @Get()
//   async check(): Promise<string> {
//     await this.myQueue.add('my-job', {
//       foo: 'bar',
//     });

//     return 'OK';
//   }
// }
