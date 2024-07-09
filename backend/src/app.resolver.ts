import { Query, Resolver } from '@nestjs/graphql';
import { Field, ObjectType } from '@nestjs/graphql';


@ObjectType()
export class Result {
  @Field()
  result: string;
}

@Resolver()
export class AppResolver {
  @Query(() => Result)
  result(): Result {
    return {
      result: 'OK',
    };
  }
}
