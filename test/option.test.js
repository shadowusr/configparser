import {option} from '../src/core';
import {MissingOptionError} from '../src/errors';
import {assert} from 'chai';
import sinon from 'sinon';

describe('option', () => {
    const LAZY_CONFIG = {
        root: {}
    };

    it('should parse a simple option', () => {
        const parser = option({});

        const value = parser({option: 'value'}, LAZY_CONFIG);

        assert.equal(value, 'value');
    });

    it('should allow to override it with env var', () => {
        const parser = option({});

        const value = parser({
            option: 'value',
            envVar: 'from env'
        }, LAZY_CONFIG);

        assert.equal(value, 'from env');
    });

    it('should call parseEnv callback with env value', () => {
        const parseEnv = sinon.stub();
        const parser = option({parseEnv});

        parser({
            envVar: 'from env'
        }, LAZY_CONFIG);

        assert.calledWith(parseEnv, 'from env');
    });

    it('should return the value returned by parseEnv callback', () => {
        const parser = option({
            parseEnv: sinon.stub().returns('parsed')
        });

        const value = parser({
            envVar: ''
        }, LAZY_CONFIG);

        assert.equal(value, 'parsed');
    });

    it('should allow to override it with cli flag', () => {
        const parser = option({});

        const value = parser({
            option: 'value',
            envVar: 'from env',
            cliOption: 'from cli'
        }, LAZY_CONFIG);

        assert.equal(value, 'from cli');
    });

    it('should call parseCli callback with argv value', () => {
        const parseCli = sinon.stub();
        const parser = option({parseCli});

        parser({
            cliOption: 'option'
        }, LAZY_CONFIG);

        assert.calledWith(parseCli, 'option');
    });

    it('should return the value returned by parseCli callback', () => {
        const parser = option({
            parseCli: sinon.stub().returns('parsed')
        });

        const value = parser({
            cliOption: ''
        }, LAZY_CONFIG);

        assert.equal(value, 'parsed');
    });

    it('should return defaultValue if no option set', () => {
        const parser = option({
            defaultValue: 'def'
        });

        const value = parser({}, LAZY_CONFIG);

        assert.equal(value, 'def');
    });

    it('should not return default if option is set', () => {
        const parser = option({
            defaultValue: 'def'
        });

        const value = parser({option: 'value'}, LAZY_CONFIG);

        assert.equal(value, 'value');
    });

    it('should throw if no default nor value is set', () => {
        const parser = option({});
        assert.throws(() => parser({}, LAZY_CONFIG), MissingOptionError);
    });

    function testAfterParseCallback(name) {
        it(`should call ${name} callback on an parser`, () => {
            const callback = sinon.stub().named(name);
            const parser = option({
                [name]: callback
            });

            parser({option: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'value', LAZY_CONFIG.root);
        });

        it(`should call ${name} callback on a parsed env var`, () => {
            const callback = sinon.stub().named(name);
            const parseEnv = sinon.stub().returns('parsed');
            const parser = option({
                parseEnv,
                [name]: callback
            });

            parser({envVar: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'parsed');
        });

        it(`should call ${name} callback on a parsed cli flag`, () => {
            const callback = sinon.stub().named(name);
            const parseCli = sinon.stub().returns('parsed');
            const parser = option({
                parseCli,
                [name]: callback
            });

            parser({cliOption: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'parsed');
        });
    }

    testAfterParseCallback('validate');
    testAfterParseCallback('map');

    it('should return value returned by map callback', () => {
        const map = sinon.stub().returns('mapped');
        const parser = option({map});

        const value = parser({option: 'value'}, LAZY_CONFIG);
        assert.equal(value, 'mapped');
    });
});