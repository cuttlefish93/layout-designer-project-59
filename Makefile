install:
	npm install

lint:
	npx stylelint ./build/css/*.css
	npx stylelint ./app/scss/**/*.scss

deploy:
	npx surge ./src/
