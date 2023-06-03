install:
	npm install

lint:
	npx stylelint ./src/css/*.css
	npx stylelint ./src/scss/**/*.scss

deploy:
	npx surge ./src/
