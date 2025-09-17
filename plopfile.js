const fs = require('fs');

function parseErdFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const entities = {};
  let currentEntity = null;

  lines.forEach((line) => {
    line = line.trim();

    if (line.startsWith('entity') || line.startsWith('weak entity')) {
      const entityName = line.split(' ')[line.split(' ').length - 2];
      currentEntity = { name: entityName, fields: [] };
      entities[entityName] = currentEntity;
    } else if (currentEntity && line.includes(':')) {
      const [fieldName, fieldDef] = line.split(':').map((part) => part.trim());

      const [fieldType, fieldConstraint] = fieldDef.split(' ');

      currentEntity.fields.push({
        name: fieldName,
        type: fieldType,
        isKey: fieldConstraint == 'key' || fieldConstraint == 'partial-key'
      });
    } else if (line === '') {
      currentEntity = null;
    }
  });

  return entities;
}

module.exports = function (plop) {
  plop.setHelper('nameCase', function (text) {
    // split by uppercase letters
    let textParts = text.split(/(?=[A-Z])/);

    // map to lowercase and join with spaces
    return textParts.map((part) => part.toLowerCase()).join(' ');
  });

  plop.setGenerator('resource', {
    description: 'Create a resource based on an ERD.',
    prompts: [
      {
        type: 'input',
        name: 'erd',
        message: 'Enter the ERD filepath (e.g.: docs/model.erd)',
        default: 'docs/model.erd'
      },
      {
        type: 'input',
        name: 'entity',
        message: 'Enter the entity name that you want to generate as resource (e.g.: User)'
      },
      {
        type: 'input',
        name: 'embedEntities',
        message: 'Enter related entities to embed (comma-separated, e.g.: Profile,Device)',
        default: ''
      },
      {
        type: 'confirm',
        name: 'importModule',
        message: 'Do you want to import the new module in app.module.ts?',
        default: true
      }
    ],
    actions: (data) => {
      const entities = parseErdFile(data.erd);
      const entity = entities[data.entity];

      if (!entity) {
        throw new Error(`Entity ${data.entity} not found in ERD file.`);
      }

      console.log('Generating for Entity:');
      console.dir(entity, { depth: null });

      const embedEntities =
        data.embedEntities.trim().length > 0
          ? data.embedEntities
              .trim()
              .split(',')
              .map((name) => {
                if (!entities[name]) {
                  throw new Error(`Embedded Entity ${name} not found in ERD file.`);
                }
                return entities[name];
              })
          : [];

      if (embedEntities.length > 0) {
        console.log('With embedded entities:');
        console.dir(embedEntities, { depth: null });
      }

      data.entity = entity;
      data.embedEntities = embedEntities;

      return [
        {
          type: 'add',
          path: 'src/{{dashCase entity.name}}s/{{dashCase entity.name}}s.module.ts',
          templateFile: 'templates/resource/resource.module.hbs',
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'src/{{dashCase entity.name}}s/{{dashCase entity.name}}s.resolver.ts',
          templateFile: 'templates/resource/resource.resolver.hbs',
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'src/{{dashCase entity.name}}s/{{dashCase entity.name}}s.service.ts',
          templateFile: 'templates/resource/resource.service.hbs',
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'src/{{dashCase entity.name}}s/entities/{{dashCase entity.name}}.entity.ts',
          templateFile: 'templates/resource/entities/resource.entity.hbs',
          skipIfExists: true
        },
        ...(embedEntities.length > 0
          ? embedEntities.map((embedEntity) => ({
              type: 'add',
              path: `src/{{dashCase entity.name}}s/entities/{{dashCase embedEntity.name}}.entity.ts`,
              templateFile: 'templates/resource/entities/resource.embedEntity.hbs',
              data: {
                embedEntity: embedEntity
              },
              skipIfExists: true
            }))
          : []),
        {
          type: 'modify',
          path: 'src/app.module.ts',
          pattern: /(@Module\({)/,
          template: `import { {{properCase entity.name}}sModule } from './{{dashCase entity.name}}s/{{dashCase entity.name}}s.module';\n\n$1`,
          skip: () => (data.importModule ? undefined : 'Skipping import in app.module.ts')
        },
        {
          type: 'modify',
          path: 'src/app.module.ts',
          pattern: /(\/\/ resources modules\s*\n)([\s\S]*?)(\])/,
          template: `$1    {{properCase entity.name}}sModule,\n$2$3`,
          skip: () => (data.importModule ? undefined : 'Skipping import in app.module.ts')
        }
      ];
    }
  });
};
