import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { beginCell, Cell, toNano } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task4', () => {
  let code: Cell;

  beforeAll(async () => {
    code = await compile('Task4');
  });

  let blockchain: Blockchain;
  let task4: SandboxContract<Task4>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();

    task4 = blockchain.openContract(Task4.createFromConfig({}, code));

    const deployer = await blockchain.treasury('deployer');

    const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: task4.address,
      deploy: true,
      success: true,
    });
  });

  it('should encrypt', async () => {
    const source = beginCell()
      .storeUint(0, 32)
      .storeStringTail(Array(123).fill('a').join(''))
      .storeRef(
        beginCell()
          .storeStringTail(Array(127).fill('b').join(''))
          .storeRef(
            beginCell()
              .storeStringTail(Array(127).fill('c').join(''))
              .endCell(),
          )
          .endCell(),
      )
      .endCell();
    const encrypted = await task4.getEncrypt(0n, source);
    const decrypted = await task4.getDecrypt(0n, encrypted);
    expect(decrypted).toEqualCell(source);
  });

  it('should decrypt', async () => {
    const result = await task4.getDecrypt(3n, beginCell().storeUint(0, 32).storeStringTail('dd').endCell());
    expect(result).toEqualCell(beginCell().storeUint(0, 32).storeStringTail('aa').endCell());
  });
});
