(module
  (memory (export "memory") 1)

  (func (export "xorDecrypt") (param $ptr i32) (param $len i32) (param $key i32)
    (local $i i32)
    (local $val i32)

    (local.set $i (i32.const 0))
    (block $exit
      (loop $loop
        (br_if $exit (i32.ge_u (local.get $i) (local.get $len)))

        (local.set $val (i32.load8_u (i32.add (local.get $ptr) (local.get $i))))
        (local.set $val (i32.xor (local.get $val) (local.get $key)))
        (i32.store8
          (i32.add (local.get $ptr) (local.get $i))
          (local.get $val)
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )
  )

  (func (export "deriveKey") (param $base i32) (param $index i32) (result i32)
    (i32.add
      (local.get $base)
      (i32.mul (local.get $index) (i32.const 7))
    )
  )
)
