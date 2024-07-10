import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignInReturn {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  token: string;
}

@ObjectType()
export class SignUpReturn {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
