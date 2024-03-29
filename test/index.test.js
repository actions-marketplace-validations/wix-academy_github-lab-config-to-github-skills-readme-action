const process = require("process");
const cp = require("child_process");

const itif = (condition) => condition ? it : it.skip;
const itSkipInCI = itif(!process.env['CI'])

const describeif = (condition) => condition ? describe : describe.skip;
const describeSkipInCI = describeif(!process.env['CI'])

const {
  generateReadmeFromConfig,
  isPathtoRelativeMdFile,
  extractYTVidfromUrl
} = require("../generate-github-skills-readme-from-lab-config");

test("generate readme", async () => {
  const readme = await generateReadmeFromConfig(
    "test/config.yml",
    "test/course-details.md",
    "test/out/readme.md"
  );

  const readmeWithRoot = await generateReadmeFromConfig(
    "config.yml",
    "course-details.md",
    "out/readme.md",
    "test/",
  );

  expect(readme).toEqual(readmeWithRoot);
  expect(readme).toMatchSnapshot();
});

test('generate readme with metadata', async () => {
  const readmeWithMetadata = await generateReadmeFromConfig(
    "config-metadata.yml",
    "course-details.md",
    "out/readme-metadata.md",
    "test/",
  );

  expect(readmeWithMetadata).toMatchSnapshot(); 
})

test('extractYTVidfromUrl', () => {
  expect(extractYTVidfromUrl('https://www.youtube.com/embed/ISAplsTsIOE')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('https://www.youtube.com/embed/ISAplsTsIOE/')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('https://youtube.com/embed/ISAplsTsIOE')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('http://youtube.com/embed/ISAplsTsIOE/')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('https://youtu.be/gal01wQlHzo')).toBeFalsy()
})

// shows how the runner will run a javascript action with env / stdout protocol
itSkipInCI("test runs", () => {
  process.env["INPUT_CONFIG-FILE"] = "test/config.yml";
  process.env["INPUT_COURSE-DETAILS-FILE"] = "test/course-details.md";
  process.env["INPUT_README-FILE"] = "test/out/readme.md";
  process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "false";
  process.env["INPUT_ROOT-PATH"] = "./"; 
  const result = cp.execSync(`node index.js`, { env: process.env }).toString();
  console.log(result);
});

describe("Addon", () => {
  describe("Files & Inline links", () => {
    test("relative file logic", () => {
      expect(isPathtoRelativeMdFile('./steps/0.md')).toBe(true)
      expect(isPathtoRelativeMdFile('steps/0.md')).toBe(true)
      expect(isPathtoRelativeMdFile('https://www.google.com/steps/0.md')).toBe(false)
      expect(isPathtoRelativeMdFile('https://www.google.com')).toBe(false)
      expect(isPathtoRelativeMdFile('steps/fdsfsd/fdsfsd/fdsf.txt')).toBe(false) 
      expect(isPathtoRelativeMdFile('steps/fdsfsd/fdsfsd/fdsf.md')).toBe(true) 
    })

    test("generate readme with inline files", async () => {
      const readme = await generateReadmeFromConfig(
        "config-with-files.yml",
        "course-details.md",
        "out/readme-with-files-no-inline-links.md",
        "test/"
      );
    
      expect(readme).toMatchSnapshot();
    });
    
    test("generate readme with inline files - inline all links options", async () => {
      const readme = await generateReadmeFromConfig(
        "config-with-files.yml",
        "course-details.md",
        "out/readme-with-files-inline-links.md",
        "test",
        {
          inlineMDlinks: true,
        }
      );
    
      expect(readme).toMatchSnapshot();
    });

    describeSkipInCI("test runs", () => {
      test("with files with inline links", () => {
        process.env["INPUT_CONFIG-FILE"] = "config-with-files.yml";
        process.env["INPUT_COURSE-DETAILS-FILE"] = "course-details.md";
        process.env["INPUT_README-FILE"] = "out/readme-with-files-inline-links.md";
        process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "true";
        process.env["INPUT_ROOT-PATH"] = "./test"; 
        const result = cp
          .execSync(`node index.js`, { env: process.env })
          .toString();
        console.log(result);
      });
  
      test("with files no inline links", () => {
        process.env["INPUT_CONFIG-FILE"] = "config-with-files.yml";
        process.env["INPUT_COURSE-DETAILS-FILE"] = "course-details.md";
        process.env["INPUT_README-FILE"] = "out/readme-with-files-no-inline-links.md";
        process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "false";
        process.env["INPUT_ROOT-PATH"] = "./test"; 
        const result = cp
          .execSync(`node index.js`, { env: process.env })
          .toString();
        console.log(result);
      });
    })
  });
});
