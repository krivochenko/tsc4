import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { beginCell, Cell, toNano } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task3', () => {
  let code: Cell;

  beforeAll(async () => {
    code = await compile('Task3');
  });

  let blockchain: Blockchain;
  let task3: SandboxContract<Task3>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();

    task3 = blockchain.openContract(Task3.createFromConfig({}, code));

    const deployer = await blockchain.treasury('deployer');

    const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: task3.address,
      deploy: true,
      success: true,
    });
  });

  it('should find and replace #0', async () => {
    const text = beginCell().storeUint(0b11000, 5).endCell();
    const result = await task3.getFindAndReplace(1100n, 111n, text);
    expect(result).toEqualCell(beginCell().storeUint(0b1110, 4).endCell());
  });

  it('should find and replace #1', async () => {
    const text = beginCell().storeUint(0b110011001100, 12).endCell();
    const result = await task3.getFindAndReplace(10n, 111n, text);
    expect(result).toEqualCell(beginCell().storeUint(0b111101111011110, 15).endCell());
  });

  // it('should find and replace #2', async () => {
  //   const text = beginCell().storeStringTail(Array(15).fill(1).join('')).endCell();
  //   const result = await task3.getFindAndReplace(1n, 1111111111n, text);
  //   expect(result).toEqualCell(
  //     beginCell()
  //       .storeStringTail(Array(127).fill(1).join(''))
  //       .storeStringRefTail(Array(23).fill(1).join(''))
  //       .endCell(),
  //     );
  // });
  //
  // it('should find and replace #3', async () => {
  //   const text = beginCell()
  //     .storeStringTail('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110100001011')
  //     .storeStringRefTail('101010001111110000000000000000')
  //     .endCell();
  //   const result = await task3.getFindAndReplace(101110101n, 111111111n, text);
  //   expect(result).toEqualCell(
  //     beginCell()
  //       .storeStringTail('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110100001111')
  //       .storeStringRefTail('111110001111110000000000000000')
  //       .endCell(),
  //   );
  // });
});
