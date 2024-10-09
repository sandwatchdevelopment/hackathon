rm -rf dist package
poetry install --only main --sync
poetry build
poetry run pip install --upgrade -t package dist/*.whl
cd package; mkdir -p out; zip -r -q out/popcorn.zip . -x '*.pyc'
cp out/popcorn.zip ../