(ns engine.handlers)

(defmulti
  handler
  "Generic handler differentiated by a keyword code."
  identity)

(defmacro create-handler
  "Creates and registers given handler method for the given code.
  Handler should have arguments [game object-id & handler-args]."
  [code & fn-tail]
  `(defmethod handler ~code
     [_#]
     (fn ~@fn-tail)))

(defn- pass
  "Dummy handler that does nothing and returns first argument."
  [g & _]
  g)

(defn- chain-handlers
  "Chains two handlers."
  [h1 h2]
  (fn [g & more]
    (apply h2 (apply h1 g more) more)))

(defn- get-handler
  [obj event]
  (let [handlers (get-in obj [:handlers event])]
    (if (seq handlers)
      (reduce chain-handlers (map handler handlers))
      pass)))

(defn handle
  "Gets the approppriate handler for the object and calls it
  with arguments [g obj-id & h-args]."
  [g obj-id event & h-args]
  (let [obj (get-in g [:objects obj-id])
        handler-fn (get-handler obj event)]
    (apply handler-fn g obj-id h-args)))


(defn add-handler
  [g obj-id event handler-code]
  (update-in g [:objects obj-id :handlers event] conj handler-code))


(defn remove-handler
  [g obj-id event handler-code]
  (update-in g [:objects obj-id :handlers event] #(remove #{handler-code} %)))