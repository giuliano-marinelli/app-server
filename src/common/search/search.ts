import { PipeTransform, Type } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import {
  FieldOptions,
  GqlTypeReference,
  ReturnTypeFunc,
  ReturnTypeFuncValue,
  TypeMetadataStorage,
  addFieldMetadata
} from '@nestjs/graphql';
import { ClassType } from '@nestjs/graphql/dist/enums/class-type.enum';
import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { addClassTypeMetadata } from '@nestjs/graphql/dist/utils/add-class-type-metadata.util';

import {
  And,
  Any,
  Between,
  Equal,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Or
} from 'typeorm';

import { OrderDirection } from './order.input';
import { BooleanWhereInput, DateTimeWhereInput, IntWhereInput, StringWhereInput } from './where.input';

// import { StringEqualFilterInput, StringFilterInput } from './filter.input';

const filterFields = {};

type FieldOptionsExtractor<T> = T extends [GqlTypeReference<infer P>]
  ? FieldOptions<P[]>
  : T extends GqlTypeReference<infer P>
    ? FieldOptions<P>
    : never;

export function FilterField(): PropertyDecorator;
export function FilterField<T extends ReturnTypeFuncValue>(options: FieldOptionsExtractor<T>): PropertyDecorator;
export function FilterField<T extends ReturnTypeFuncValue>(
  returnTypeFunction?: ReturnTypeFunc<T>,
  options?: FieldOptionsExtractor<T>
): PropertyDecorator;
export function FilterField<T extends ReturnTypeFuncValue>(
  typeOrOptions?: ReturnTypeFunc<T> | FieldOptionsExtractor<T>,
  fieldOptions?: FieldOptionsExtractor<T>
): PropertyDecorator {
  return (target, propertyKey) => {
    let [typeFunc, options] = isFunction(typeOrOptions)
      ? [typeOrOptions, fieldOptions]
      : [undefined, typeOrOptions as any];

    // get the type of the property for use if no type is provided
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey).name;
    if (!typeFunc) {
      switch (propertyType) {
        case 'Number':
          typeFunc = () => IntWhereInput as T;
          break;
        case 'Boolean':
          typeFunc = () => BooleanWhereInput as T;
          break;
        case 'Date':
          typeFunc = () => DateTimeWhereInput as T;
          break;
        case 'String':
        default:
          typeFunc = () => StringWhereInput as T;
          break;
      }
    }

    if (!options) options = { nullable: true };

    if (!filterFields[target.constructor.name]) filterFields[target.constructor.name] = [];
    filterFields[target.constructor.name].push({ typeFunc, options, propertyKey });
  };
}

export function FilterWhereType<T>(classRef: Type<T>): ClassDecorator {
  return (target) => {
    const metadata = {
      target,
      name: target.name,
      description: '',
      isAbstract: false
    };
    LazyMetadataStorage.store(() => TypeMetadataStorage.addInputTypeMetadata(metadata));
    addClassTypeMetadata(target, ClassType.INPUT);
    filterFields[classRef.name]?.forEach((field) => {
      addFieldMetadata(field.typeFunc, field.options, target.prototype, field.propertyKey);
    });
  };
}

export function FilterOrderType<T>(classRef: Type<T>): ClassDecorator {
  return (target) => {
    const metadata = {
      target,
      name: target.name,
      description: '',
      isAbstract: false
    };
    LazyMetadataStorage.store(() => TypeMetadataStorage.addInputTypeMetadata(metadata));
    addClassTypeMetadata(target, ClassType.INPUT);
    filterFields[classRef.name]?.forEach((field) => {
      addFieldMetadata(() => OrderDirection, field.options, target.prototype, field.propertyKey);
    });
  };
}

export class TypeORMWhereTransform<T> implements PipeTransform {
  transform(value: T) {
    // console.log('graphql filter', JSON.stringify(value, null, 2));
    console.log('typeorm filter', JSON.stringify(transformTypeORMWhere(value), null, 2));
    return transformTypeORMWhere(value) as FindOptionsWhere<T>;
  }
}

// receives the entity specific T filter and transforms it into a typeorm filter (FindOptionsWhere<T>)
// specifically transform: eq, ne, gt, gte, lt, lte, like, ilike, in, any, between, and, or, not. Into typeorm options
// example: [ { username: { and: [ { eq: "asd" }, { like: "%s%" } ] } }, { role: { ne: "user" } } ]
// transformed: [ { username: And(Equal("asd"), Like("%s%")), role: Not(Equal("user")) } ]
const transformTypeORMWhere = (where: any): any[] | any => {
  let TypeORMWhere: any[] | any;

  if (!where) return {};

  if (Array.isArray(where)) {
    TypeORMWhere = [];
    where.forEach((wherePart) => {
      const transformedWherePart = transformTypeORMWhere(wherePart);
      if (Array.isArray(transformedWherePart)) TypeORMWhere.push(...transformedWherePart);
      else TypeORMWhere.push(transformedWherePart);
    });
  } else if (typeof where == 'object') {
    TypeORMWhere = {};
    Object.keys(where)?.forEach((field) => {
      if (field == 'and') {
        TypeORMWhere = And(...transformTypeORMWhere(where[field]));
      } else if (field == 'or') {
        TypeORMWhere = Or(...transformTypeORMWhere(where[field]));
      } else if (field == 'not') {
        TypeORMWhere = Not(transformTypeORMWhere(where[field]));
      } else if (field == 'eq') {
        TypeORMWhere = Equal(where[field]);
      } else if (field == 'ne') {
        TypeORMWhere = Not(Equal(where[field]));
      } else if (field == 'gt') {
        TypeORMWhere = MoreThan(where[field]);
      } else if (field == 'gte') {
        TypeORMWhere = MoreThanOrEqual(where[field]);
      } else if (field == 'lt') {
        TypeORMWhere = LessThan(where[field]);
      } else if (field == 'lte') {
        TypeORMWhere = LessThanOrEqual(where[field]);
      } else if (field == 'like') {
        TypeORMWhere = Like(where[field]);
      } else if (field == 'ilike') {
        TypeORMWhere = ILike(where[field]);
      } else if (field == 'in') {
        TypeORMWhere = In(where[field]);
      } else if (field == 'any') {
        TypeORMWhere = Any(where[field]);
      } else if (field == 'between') {
        TypeORMWhere = Between(where[field][0], where[field][1]);
      } else {
        TypeORMWhere[field] = transformTypeORMWhere(where[field]);
      }
    });
  }

  return TypeORMWhere;
};

export class TypeORMOrderTransform<T> implements PipeTransform {
  transform(value: T) {
    console.log('typeorm order', JSON.stringify(transformTypeORMOrder(value), null, 2));
    return transformTypeORMOrder(value) as FindOptionsOrder<T>;
  }
}

const transformTypeORMOrder = (order: any): any => {
  const TypeORMOrder: any = {};

  if (!order) return {};

  if (Array.isArray(order)) {
    order.forEach((orderPart) => {
      Object.keys(orderPart)?.forEach((field) => {
        TypeORMOrder[field] = orderPart[field];
      });
    });
  } else {
    Object.keys(order)?.forEach((field) => {
      TypeORMOrder[field] = order[field];
    });
  }

  return TypeORMOrder;
};
