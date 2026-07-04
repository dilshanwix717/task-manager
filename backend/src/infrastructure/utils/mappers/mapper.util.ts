import { plainToInstance, instanceToPlain } from 'class-transformer';

export class Mapper {
  // Transform a single model instance to entity
  static toEntity<T, U>(model: T, entityClass: new () => U): U {
    const plainObject = instanceToPlain(model);
    return plainToInstance(entityClass, plainObject);
  }

  // Transform an array of models to entities
  static toEntities<T, U>(models: T[], entityClass: new () => U): U[] {
    const plainArray = models.map((model) => instanceToPlain(model));
    return plainToInstance(entityClass, plainArray);
  }

  // Transform a single entity to model
  static toModel<T, U>(entity: U, modelClass: new () => T): T {
    const plainObject = instanceToPlain(entity);
    return plainToInstance(modelClass, plainObject);
  }

  // Transform an array of entities to models

  static toModels<T, U>(entities: U[], modelClass: new () => T): T[] {
    const plainArray = entities.map((entity) => instanceToPlain(entity));
    return plainToInstance(modelClass, plainArray);
  }

  // Alternative: Combined mapper for single items
  static map<T, U>(source: T, destinationClass: new () => U): U;
  static map<T, U>(source: T[], destinationClass: new () => U): U[];
  static map<T, U>(source: T | T[], destinationClass: new () => U): U | U[] {
    if (Array.isArray(source)) {
      const plainArray = source.map((item) => instanceToPlain(item));
      return plainToInstance(destinationClass, plainArray);
    }
    const plainObject = instanceToPlain(source);
    return plainToInstance(destinationClass, plainObject);
  }
}
